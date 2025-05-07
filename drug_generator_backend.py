from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from rdkit import Chem
from rdkit.Chem import Draw, Descriptors
from io import BytesIO
import base64
import random

drug_bp = Blueprint('drug', __name__)

def calculate_molecular_properties(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        return None
    return {
        'LogP': Descriptors.MolLogP(mol),
        'pIC50': 5.0 + 0.1 * Descriptors.MolLogP(mol) + 0.01 * Descriptors.MolWt(mol)
    }

def calculate_reward(smiles):
    props = calculate_molecular_properties(smiles)
    if not props:
        return 0.0
    
    # Reward function: 60% pIC50, 30% drug-likeness (LogP), 10% randomness
    reward = (
        0.6 * props['pIC50'] + 
        0.3 * (1 - abs(props['LogP'] - 2.5)) +  # Penalize LogP far from 2.5
        0.1 * random.uniform(0.8, 1.0)  # Small randomness
    )
    return reward

def smiles_to_image(smiles):
    mol = Chem.MolFromSmiles(smiles)
    img = Draw.MolToImage(mol)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

@drug_bp.route('/generate', methods=['POST'])
@cross_origin()
def generate_molecules():
    try:
        data = request.get_json()
        smiles = data.get('SMILES', '').strip()
        
        if not smiles:
            return jsonify({"error": "SMILES string is required"}), 400

        # Mock generation - returns 5 molecules with calculated rewards
        base_smiles = [
            "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",  # Caffeine
            "CC(=O)OC1=CC=CC=C1C(=O)O",      # Aspirin
            "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", # Ibuprofen
            "C1=CC=C(C=C1)C=O",              # Benzaldehyde
            "C1CCCCC1",                      # Cyclohexane
            "CCO",                            # Ethanol
            "CCN(CC)CC",                     # Triethylamine
            "C1=CC=CC=C1"                    # Benzene
        ]
        
        # Generate 5 unique molecules with rewards
        results = []
        for smiles in random.sample(base_smiles, 5):
            props = calculate_molecular_properties(smiles)
            results.append({
                "SMILES": smiles,
                "image": smiles_to_image(smiles),
                "pIC50": props['pIC50'],
                "LogP": props['LogP'],
                "Reward": calculate_reward(smiles)
            })

        # Sort by Reward (descending)
        results.sort(key=lambda x: x['Reward'], reverse=True)

        return jsonify({"top_results": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@drug_bp.route('/status', methods=['GET'])
@cross_origin()
def status():
    return jsonify({"status": "ready"})