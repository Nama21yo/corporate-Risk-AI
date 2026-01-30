from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os

app = Flask(__name__)
CORS(app)

# Load model and data
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'financial_risk_model.pkl')

def load_model():
    """Load model, scaler, and metadata from pickle file."""
    with open(MODEL_PATH, 'rb') as file:
        return pickle.load(file)

try:
    data = load_model()
    model = data["model"]
    scaler = data["scaler"]
    feature_names = data["feature_names"]
except FileNotFoundError:
    print("Warning: Model file not found. API will not function properly.")
    model = None
    scaler = None
    feature_names = []

THRESHOLD = 0.40


@app.route('/api/features', methods=['GET'])
def get_features():
    """Get available features and their default values."""
    if scaler is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    features = []
    for i, name in enumerate(feature_names):
        features.append({
            'name': name,
            'default': float(scaler.mean_[i]),
            'min': 0.0,
            'max': 1.0
        })
    return jsonify({'features': features})

@app.route('/api/predict/single', methods=['POST'])
def predict_single():
    """Predict risk for a single company."""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        user_data = request.json
        
        # Initialize with mean values
        input_values = scaler.mean_.reshape(1, -1)
        input_df = pd.DataFrame(input_values, columns=feature_names)
        
        # Update with user-provided values
        for col, value in user_data.items():
            if col in input_df.columns:
                input_df[col] = value
        
        input_scaled = scaler.transform(input_df)
        probability = model.predict_proba(input_scaled)[0][1]
        prediction_class = probability > THRESHOLD
        
        # Calculate feature importance (simplified SHAP-like analysis)
        feature_impacts = []
        for i, name in enumerate(feature_names):
            if name in user_data:
                # Calculate deviation from mean
                deviation = user_data[name] - scaler.mean_[i]
                feature_impacts.append({
                    'feature': name,
                    'value': float(user_data[name]),
                    'impact': float(deviation * 0.1)  # Simplified impact calculation
                })
        
        # Sort by absolute impact
        feature_impacts.sort(key=lambda x: abs(x['impact']), reverse=True)
        
        return jsonify({
            'probability': float(probability),
            'isHighRisk': bool(prediction_class),
            'threshold': THRESHOLD,
            'featureImpacts': feature_impacts[:5]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/template', methods=['GET'])
def get_template():
    """Get CSV template columns."""
    return jsonify({
        'columns': list(feature_names)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
