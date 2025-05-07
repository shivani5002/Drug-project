from flask import Blueprint, request, jsonify
from flask_pymongo import PyMongo
from tokenizers import Tokenizer
from tokenizers.models import BPE
import torch
import json 
import torch.nn as nn
from datetime import datetime
from collections import OrderedDict
import time

smiles_bp = Blueprint('smiles', __name__)
prediction_cache = OrderedDict()

MAX_CACHE_SIZE = 100 

# ----------------------------
# Load Tokenizer & Vocab
# ----------------------------

# Load vocab
with open("updated_vocab.json", "r") as f:
    vocab = json.load(f)

# Load tokenizer from vocab and merges
bpe_model = BPE.from_file("updated_vocab.json", "merges.txt")
tokenizer = Tokenizer(bpe_model)
tokenizer.add_special_tokens(['<mask>'])

# ----------------------------
# Model Architecture (same as before)
# ----------------------------

class RoBERTaEmbedding(nn.Module):
    def __init__(self, vocab_size, embed_dim=256, max_len=128):
        super().__init__()
        self.token_embed = nn.Embedding(vocab_size, embed_dim)
        self.position_embed = nn.Embedding(max_len, embed_dim)
        self.norm = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(0.1)

    def forward(self, input_ids):
        positions = torch.arange(0, input_ids.size(1)).unsqueeze(0).to(input_ids.device)
        x = self.token_embed(input_ids) + self.position_embed(positions)
        return self.dropout(self.norm(x))

class MultiHeadSelfAttention(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        self.q_proj = nn.Linear(embed_dim, embed_dim)
        self.k_proj = nn.Linear(embed_dim, embed_dim)
        self.v_proj = nn.Linear(embed_dim, embed_dim)
        self.out_proj = nn.Linear(embed_dim, embed_dim)
        self.dropout = nn.Dropout(0.1)

    def forward(self, x):
        B, T, D = x.size()
        Q = self.q_proj(x)
        K = self.k_proj(x)
        V = self.v_proj(x)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (D ** 0.5)
        weights = torch.softmax(scores, dim=-1)
        out = torch.matmul(weights, V)
        return self.dropout(self.out_proj(out))

class CustomTransformerBlock(nn.Module):
    def __init__(self, embed_dim, num_heads, ff_hidden=512):
        super().__init__()
        self.attn = MultiHeadSelfAttention(embed_dim, num_heads)
        self.norm1 = nn.LayerNorm(embed_dim)
        self.ff = nn.Sequential(
            nn.Linear(embed_dim, ff_hidden),
            nn.ReLU(),
            nn.Linear(ff_hidden, embed_dim),
        )
        self.norm2 = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(0.1)

    def forward(self, x):
        x = self.norm1(x + self.attn(x))
        x = self.norm2(x + self.dropout(self.ff(x)))
        return x

class RoBERTaForMaskedLM(nn.Module):
    def __init__(self, vocab_size, embed_dim=256, num_layers=4, max_len=128):
        super().__init__()
        self.embedding = RoBERTaEmbedding(vocab_size, embed_dim, max_len)
        self.encoder = nn.Sequential(*[
            CustomTransformerBlock(embed_dim, num_heads=8)
            for _ in range(num_layers)
        ])
        self.lm_head = nn.Linear(embed_dim, vocab_size)

    def forward(self, input_ids):
        x = self.embedding(input_ids)
        x = self.encoder(x)
        return self.lm_head(x)

# ----------------------------
# Load Model
# ----------------------------

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = RoBERTaForMaskedLM(len(vocab))
model.load_state_dict(torch.load("smiles_model.pth", map_location=device))
model.to(device)
model.eval()

# ----------------------------
# Helper Functions
# ----------------------------

def encode_input(smiles, tokenizer, vocab):
    encoded = tokenizer.encode(smiles)
    tokens = []
    for token in encoded.tokens:
        if token == "<mask>":
            tokens.append(vocab["<mask>"])
        else:
            tokens.append(vocab.get(token, vocab["[UNK]"]))
    return torch.tensor(tokens).unsqueeze(0).to(device)

def cache_prediction(smiles_input, predictions):
    global prediction_cache
    # Maintain cache size
    if smiles_input not in prediction_cache and len(prediction_cache) >= MAX_CACHE_SIZE:
        prediction_cache.popitem(last=False)
    prediction_cache[smiles_input] = {
        'predictions': predictions,
        'timestamp': datetime.now().isoformat()
    }

@smiles_bp.route('/cache-info', methods=['GET'])
def cache_info():
    return jsonify({
        'cache_size': len(prediction_cache),
        'cache_contents': list(prediction_cache.keys()),
        'max_size': MAX_CACHE_SIZE
    })

@smiles_bp.route('/predict-smiles', methods=['POST'])
def predict_smiles():
    start_time = time.time()
    try:
        data = request.get_json()
        print("Received JSON:", bool(data))
        
        if not data:
            print("Error: No JSON data")
            return jsonify({'error': 'No JSON data received'}), 400
            
        smiles_input = data.get('smiles', '').strip()
        print("SMILES Input:", smiles_input)
        
        if not smiles_input:
            return jsonify({'error': 'SMILES string is required'}), 400
            
        if '<mask>' not in smiles_input:
            return jsonify({
                'error': 'Invalid SMILES format',
                'details': 'SMILES must contain <mask> token'
            }), 400
        
        # Check cache first
        if smiles_input in prediction_cache:
            print("Returning cached result.")
            result = prediction_cache[smiles_input]
            return jsonify({
                'input': smiles_input,
                'predictions': result['predictions'],
                'cached': True,
                'timestamp': result['timestamp']
            })
        else:
            print(f"Cache MISS for: {smiles_input}")

        input_ids = encode_input(smiles_input, tokenizer, vocab)
        mask_token_id = vocab["<mask>"]
        mask_indices = (input_ids == mask_token_id).nonzero(as_tuple=True)[1]
        
        if len(mask_indices) == 0:
            return jsonify({'error': 'No <mask> token found in input'}), 400

        with torch.no_grad():
            logits = model(input_ids)
            mask_logits = logits[0, mask_indices[0]]
            probs = torch.softmax(mask_logits, dim=-1)
            
            topk_probs, topk_indices = torch.topk(probs, k=5)
            topk_probs = topk_probs.cpu().numpy()
            topk_indices = topk_indices.cpu().numpy()
            
            predictions = []
            for prob, token_id in zip(topk_probs, topk_indices):
                token = list(vocab.keys())[list(vocab.values()).index(token_id)]
                predictions.append({
                    'token': token,
                    'probability': float(prob)
                })

        cache_prediction(smiles_input, predictions)

        return jsonify({
            'input': smiles_input,
            'predictions': predictions,
            'cached': False,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"\n!!! ERROR: {str(e)} !!!")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Prediction failed',
            'details': str(e),
            'stacktrace': traceback.format_exc()
        }), 500