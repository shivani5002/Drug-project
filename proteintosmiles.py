from flask import Blueprint, request, jsonify
import torch
import torch.nn as nn
import os
from torchtext.vocab import build_vocab_from_iterator
from models.Transformer import Transformer
import base64
from io import BytesIO
from rdkit import Chem
from rdkit.Chem import Draw
from PIL import Image
import requests
from Bio import SeqIO
from io import StringIO
import time
from collections import OrderedDict
from datetime import datetime

protein_to_smiles_bp = Blueprint('protein_to_smiles', __name__)
prediction_cache = OrderedDict()
MAX_CACHE_SIZE = 100 

# Configuration
MIN_PROTEIN_LENGTH = 10
tokenize = lambda x: list(x)

# Load model and vocabularies at module level
root = os.path.dirname(os.path.abspath(__file__))
protein_vocab = torch.load(os.path.join(root, 'utils/vocab/protein-vocab.pt'))
smiles_vocab = torch.load(os.path.join(root, 'utils/vocab/smiles-vocab.pt'))

device = "cuda" if torch.cuda.is_available() else "cpu"
model = Transformer(
    src_tokens=len(protein_vocab),
    trg_tokens=len(smiles_vocab), 
    dim_model=256, 
    num_heads=8, 
    num_encoder_layers=6, 
    num_decoder_layers=6, 
    dropout_p=0.1
).to(device)
model.load_state_dict(torch.load(os.path.join(root, 'checkpoints/checkpoint.pth'), 
                     map_location=torch.device(device)))

def predict(model, input_sequence, max_length=150, PAD_token=1, SOS_token=2, EOS_token=3):
    model.eval()
    device = next(model.parameters()).device
    
    y_input = torch.tensor([[SOS_token]], dtype=torch.long, device=device)

    for _ in range(max_length):
        tgt_mask = model.get_tgt_mask(y_input.size(1)).to(device)
        pred = model(input_sequence, y_input, tgt_mask)
        next_item = pred.topk(1)[1].view(-1)[-1].item()
        next_item = torch.tensor([[next_item]], device=device)

        y_input = torch.cat((y_input, next_item), dim=1)

        if next_item.view(-1).item() == EOS_token or next_item.view(-1).item() == PAD_token:
            break

    return y_input.view(-1).tolist()

def cache_prediction(protein_sequence, predictions, visualization):
    global prediction_cache
    # Maintain cache size
    if protein_sequence not in prediction_cache and len(prediction_cache) >= MAX_CACHE_SIZE:
        prediction_cache.popitem(last=False)
    prediction_cache[protein_sequence] = {
        'predictions': predictions,
        'visualization': visualization,
        'timestamp': datetime.now().isoformat()
    }

def protein_to_numbers(protein, protein_vocab):
    return [protein_vocab[token] for token in tokenize(protein)]

def smiles_to_string(smiles, smiles_vocab):
    return ''.join([smiles_vocab.get_itos()[word] for word in smiles])

def get_smiles_image(smiles):
    """Generate molecular image using RDKit"""
    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None
            
        img = Draw.MolToImage(mol, size=(400, 400))
        buffered = BytesIO()
        img.save(buffered, format="PNG", quality=100)
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    except Exception:
        return None
    
@protein_to_smiles_bp.route('/cache-info', methods=['GET'])
def cache_info():
    return jsonify({
        'cache_size': len(prediction_cache),
        'cache_contents': list(prediction_cache.keys()),
        'max_size': MAX_CACHE_SIZE
    })

# @protein_to_smiles_bp.route('/predict', methods=['POST'])
# def predict_smiles():
#     start_time = time.time()
#     try:
#         data = request.get_json()
#         if not data:
#             return jsonify({'error': 'No data received'}), 400
            
#         protein_sequence = data.get('sequence', '').strip()

#          # Check cache first (using normalized sequence)
#         cache_key = protein_sequence.upper()  # Normalize to uppercase for consistency
#         if cache_key in prediction_cache:
#             result = prediction_cache[cache_key]
#             processing_time = time.time() - start_time
#             return jsonify({
#                 'smiles': result['predictions'],
#                 'visualization': result['visualization'],
#                 'cached': True,
#                 'processing_time_seconds': processing_time,
#                 'timestamp': result['timestamp'],
#                 'status': 'success'
#             })
        
#         if len(protein_sequence) < MIN_PROTEIN_LENGTH:
#             return jsonify({
#                 'error': f'Minimum {MIN_PROTEIN_LENGTH} amino acids required'
#             }), 400

#         # Convert and predict
#         input_tensor = torch.tensor(
#             [protein_to_numbers(protein_sequence, protein_vocab)],
#             dtype=torch.long, 
#             device=device
#         )
#         result = predict(model, input_tensor)
#         smiles_result = smiles_to_string(result[1:-1], smiles_vocab)
        
#         # Generate visualization
#         image_data = get_smiles_image(smiles_result)
#         if not image_data:
#             return jsonify({
#                 'smiles': smiles_result,
#                 'warning': 'Could not generate visualization'
#             })
        
        
#         # Cache the result
#         cache_prediction(cache_key, smiles_result, image_data)
#         processing_time = time.time() - start_time

#         return jsonify({
#             'smiles': smiles_result,
#             'visualization': image_data,
#             'cached': False,
#             'processing_time_seconds': processing_time,
#             'timestamp': datetime.now().isoformat(),
#             'status': 'success'
#         })
        
#     except Exception as e:
#         return jsonify({
#             'error': 'Prediction failed',
#             'details': str(e),
#             'status': 'error'
#         }), 500
@protein_to_smiles_bp.route('/predict', methods=['POST'])
def predict_smiles():
    start_time = time.time()
    try:
        # Initial logging
        print("\n=== New Request ===")
        print(f"Request received at: {datetime.now().isoformat()}")
        
        # Get raw data first for cache check
        raw_data = request.get_data(as_text=True)
        cache_key = raw_data.strip().upper()  # More aggressive normalization
        
        # Check cache immediately (before any processing)
        if cache_key in prediction_cache:
            result = prediction_cache[cache_key]
            processing_time = time.time() - start_time
            print(f"Cache HIT - Processing time: {processing_time:.4f}s")
            return jsonify({
                'smiles': result['predictions'],
                'visualization': result['visualization'],
                'cached': True,
                'processing_time_seconds': processing_time,
                'timestamp': result['timestamp'],
                'status': 'success',
                'cache_info': f"Cache size: {len(prediction_cache)}/{MAX_CACHE_SIZE}"
            })

        # Only parse JSON if not in cache
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data received'}), 400
            
        protein_sequence = data.get('sequence', '').strip()
        
        # Validation
        if len(protein_sequence) < MIN_PROTEIN_LENGTH:
            return jsonify({
                'error': f'Minimum {MIN_PROTEIN_LENGTH} amino acids required'
            }), 400

        # Convert and predict
        print("Starting model prediction...")
        model_start = time.time()
        input_tensor = torch.tensor(
            [protein_to_numbers(protein_sequence, protein_vocab)],
            dtype=torch.long, 
            device=device
        )
        result = predict(model, input_tensor)
        smiles_result = smiles_to_string(result[1:-1], smiles_vocab)
        model_time = time.time() - model_start
        print(f"Model prediction took: {model_time:.4f}s")
        
        # Generate visualization
        viz_start = time.time()
        image_data = get_smiles_image(smiles_result)
        viz_time = time.time() - viz_start
        print(f"Visualization generation took: {viz_time:.4f}s")
        
        if not image_data:
            return jsonify({
                'smiles': smiles_result,
                'warning': 'Could not generate visualization'
            })

        # Cache the result
        cache_prediction(cache_key, smiles_result, image_data)
        processing_time = time.time() - start_time

        print(f"Total processing time: {processing_time:.4f}s")
        print(f"Current cache size: {len(prediction_cache)}/{MAX_CACHE_SIZE}")

        return jsonify({
            'smiles': smiles_result,
            'visualization': image_data or None,
            'cached': False,  # Make sure this is included
            'processing_time_seconds': round(time.time() - start_time, 4),
            'model_time_seconds': round(model_time, 4) if 'model_time' in locals() else 0,
            'viz_time_seconds': round(viz_time, 4) if 'viz_time' in locals() else 0,
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error',
            'processing_time_seconds': round(time.time() - start_time, 4)
        }), 500
