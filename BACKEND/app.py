# Flask Backend for Emotion Detection System
# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import logging
from datetime import datetime
import os
import pickle

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model components
model_pipeline = None
emotion_detector = None
class TextPreprocessor:
    def __init__(self):
        # initialization code
        pass

    def transform(self, text):
        # preprocessing logic
        return text


class EmotionDetector:
    """Emotion detection class for making predictions"""
    
    def __init__(self, model, vectorizer, preprocessor):
        self.model = model
        self.vectorizer = vectorizer
        self.preprocessor = preprocessor
        self.emotions = model.classes_.tolist()
    
    def predict_emotion(self, text):
        """Predict emotion for a single text"""
        try:
            # Preprocess text
            processed_text = self.preprocessor.transform(text)

            
            # Handle empty text after preprocessing
            if not processed_text.strip():
                return {
                    'error': 'Text is empty after preprocessing',
                    'predicted_emotion': 'neutral',
                    'confidence': 0.0,
                    'all_emotions': {emotion: 0.0 for emotion in self.emotions}
                }
            
            # Vectorize
            text_vector = self.vectorizer.transform([processed_text])
            
            # Predict
            prediction = self.model.predict(text_vector)[0]
            probabilities = self.model.predict_proba(text_vector)[0]
            
            # Get confidence scores for all emotions
            emotion_scores = dict(zip(self.emotions, probabilities.tolist()))
            
            return {
                'predicted_emotion': prediction,
                'confidence': float(max(probabilities)),
                'all_emotions': emotion_scores,
                'processed_text': processed_text
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {
                'error': f'Prediction failed: {str(e)}',
                'predicted_emotion': 'error',
                'confidence': 0.0,
                'all_emotions': {}
            }
    
    def predict_batch(self, texts):
        """Predict emotions for multiple texts"""
        results = []
        for i, text in enumerate(texts):
            result = self.predict_emotion(text)
            result['index'] = i
            results.append(result)
        return results

def load_model():
    """Load the trained emotion detection model"""
    global model_pipeline, emotion_detector
    
    try:
        model_path = 'emotion_detection_model.pkl'
        
        if not os.path.exists(model_path):
            logger.error(f"Model file not found: {model_path}")
            return False
        
        # Load the model pipeline
        model_pipeline = joblib.load(model_path)
        
        # Create emotion detector instance
        emotion_detector = EmotionDetector(
            model_pipeline['model'],
            model_pipeline['vectorizer'],
            model_pipeline['preprocessor']
        )
        
        logger.info(f"Model loaded successfully: {model_pipeline['model_name']}")
        logger.info(f"Available emotions: {emotion_detector.emotions}")
        return True
        
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': emotion_detector is not None
    })

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if emotion_detector is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'model_name': model_pipeline.get('model_name', 'Unknown'),
        'available_emotions': emotion_detector.emotions,
        'total_emotions': len(emotion_detector.emotions),
        'model_type': str(type(emotion_detector.model).__name__)
    })

@app.route('/predict', methods=['POST'])
def predict_single():
    """Predict emotion for a single text"""
    try:
        # Check if model is loaded
        if emotion_detector is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate input
        text = data.get('text')
        if not text:
            return jsonify({'error': 'Text field is required'}), 400
        
        if not isinstance(text, str):
            return jsonify({'error': 'Text must be a string'}), 400
        
        if len(text.strip()) == 0:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Make prediction
        result = emotion_detector.predict_emotion(text)
        
        # Add metadata
        result['timestamp'] = datetime.now().isoformat()
        result['original_text'] = text
        
        logger.info(f"Prediction made for text: '{text[:50]}...' -> {result['predicted_emotion']}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """Predict emotions for multiple texts"""
    try:
        # Check if model is loaded
        if emotion_detector is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate input
        texts = data.get('texts')
        if not texts:
            return jsonify({'error': 'texts field is required'}), 400
        
        if not isinstance(texts, list):
            return jsonify({'error': 'texts must be a list'}), 400
        
        if len(texts) == 0:
            return jsonify({'error': 'texts list cannot be empty'}), 400
        
        if len(texts) > 100:  # Limit batch size
            return jsonify({'error': 'Maximum 100 texts allowed per batch'}), 400
        
        # Validate each text
        for i, text in enumerate(texts):
            if not isinstance(text, str):
                return jsonify({'error': f'Text at index {i} must be a string'}), 400
            if len(text.strip()) == 0:
                return jsonify({'error': f'Text at index {i} cannot be empty'}), 400
        
        # Make predictions
        results = emotion_detector.predict_batch(texts)
        
        # Add metadata
        response = {
            'predictions': results,
            'total_texts': len(texts),
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Batch prediction made for {len(texts)} texts")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in batch predict endpoint: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/emotions', methods=['GET'])
def get_emotions():
    """Get list of available emotions"""
    if emotion_detector is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'emotions': emotion_detector.emotions,
        'count': len(emotion_detector.emotions)
    })

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Load model on startup
    print("Loading emotion detection model...")
    if load_model():
        print("✅ Model loaded successfully!")
        print(f"Available emotions: {emotion_detector.emotions}")
        
        # For production deployment
        port = int(os.environ.get('PORT', 5000))
        debug_mode = os.environ.get('FLASK_ENV') == 'development'
        
        if debug_mode:
            print("\n🚀 Starting Flask server in development mode...")
            print("API Endpoints:")
            print("  POST /predict - Single text emotion prediction")
            print("  POST /predict/batch - Batch text emotion prediction")
            print("  GET  /health - Health check")
            print("  GET  /model/info - Model information")
            print("  GET  /emotions - Available emotions")
            print("\n" + "="*50)
        
        app.run(debug=debug_mode, host='0.0.0.0', port=port)
    else:
        print("❌ Failed to load model. Please ensure 'emotion_detection_model.pkl' exists.")
        exit(1)


