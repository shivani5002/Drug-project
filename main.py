from flask import Flask, jsonify
from tumor_backend import tumor_bp
from protein_backend import protein_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register Blueprints
app.register_blueprint(tumor_bp, url_prefix='/api')
app.register_blueprint(protein_bp, url_prefix='/api')

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "services": ["tumor", "protein"]})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=False)