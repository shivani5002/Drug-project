from flask import Flask, jsonify
from tumor_backend import tumor_bp
from protein_backend import protein_bp
from proteintosmiles import protein_to_smiles_bp
from smiles_backend import smiles_bp 
from auth_backend import auth_bp
from flask_cors import CORS
from drug_generator_backend import drug_bp 
#from docking_backend import docking_bp
#from vit_backend import vit_bp
from flask_pymongo import PyMongo
#from nii_backend import nii_bp
import os

app = Flask(__name__)
# CORS(app, resources={
#     r"/api/*": {
#         "origins": ["*"],
#         "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
#         "allow_headers": ["Content-Type", "Authorization"]
#     }
# })

CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["*"],
        "expose_headers": ["*"]
    },
    r"/static/*": {
        "origins": ["*"],
        "methods": ["GET"],
        "allow_headers": ["*"]
    },
    r"/papaya/*": {
        "origins": ["*"],
        "methods": ["GET"],
        "allow_headers": ["*"]
    }
})

# Configuration
app.config["MONGO_URI"] = os.getenv('MONGO_URI')
mongo = PyMongo(app)
app.mongo = mongo  # Make MongoDB client available to blueprints


# Register Blueprints
app.register_blueprint(tumor_bp, url_prefix='/api')
#app.register_blueprint(nii_bp, url_prefix='/api/nii')
#app.register_blueprint(docking_bp, url_prefix='/api') 
app.register_blueprint(protein_bp, url_prefix='/api')
app.register_blueprint(protein_to_smiles_bp, url_prefix='/api')
app.register_blueprint(smiles_bp, url_prefix='/api') 
app.register_blueprint(drug_bp, url_prefix='/api/drug')
#app.register_blueprint(vit_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "services": ["tumor", "protein", "protein-to-smiles",  "masked-smiles",
                                                      "drug-generator","authentication"]})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=False)