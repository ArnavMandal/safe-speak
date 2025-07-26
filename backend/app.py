from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import pandas as pd
from tensorflow.keras.layers import TextVectorization
import re
import os
from googleapiclient.discovery import build
from urllib.parse import urlparse, parse_qs

app = Flask(__name__)
CORS(app)

# Global variables for model and vectorizer
model = None
vectorizer = None
MAX_FEATURES = 200000

def load_model_and_vectorizer():
    """Load the trained model and create vectorizer"""
    global model, vectorizer
    
    # Load the trained model
    model = tf.keras.models.load_model('toxicity.h5')
    
    # Create and configure the vectorizer (same as training)
    vectorizer = TextVectorization(max_tokens=MAX_FEATURES,
                                   output_sequence_length=1800,
                                   output_mode='int')
    
    # Load training data to adapt vectorizer
    try:
        df = pd.read_csv('jigsaw-toxic-comment-classification-challenge/train.csv')
        vectorizer.adapt(df['comment_text'].values)
        print(f"Vectorizer adapted with {len(df)} training samples")
    except FileNotFoundError:
        print("Warning: train.csv not found. Vectorizer may not work properly.")
    
    print("Model and vectorizer loaded successfully!")

def extract_video_id(url):
    """Extract YouTube video ID from various URL formats"""
    parsed_url = urlparse(url)
    
    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            return parse_qs(parsed_url.query)['v'][0]
        elif parsed_url.path.startswith('/embed/'):
            return parsed_url.path.split('/')[2]
    elif parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    
    return None

def get_youtube_comments(video_id, api_key='AIzaSyA8Aj7wmHf-13l6uavE_EA0Dmha5iWlI_c'):
    """Fetch comments from YouTube video using YouTube Data API"""
    try:
        youtube = build('youtube', 'v3', developerKey=api_key)
        
        # Get video details first
        video_response = youtube.videos().list(
            part='snippet,statistics',
            id=video_id
        ).execute()
        
        if not video_response['items']:
            return None, "Video not found"
        
        video_info = video_response['items'][0]
        
        # Get comments
        comments = []
        next_page_token = None
        
        while True:
            comment_response = youtube.commentThreads().list(
                part='snippet',
                videoId=video_id,
                maxResults=100,
                pageToken=next_page_token,
                order='relevance'
            ).execute()
            
            for item in comment_response['items']:
                comment = item['snippet']['topLevelComment']['snippet']
                comments.append({
                    'author': comment['authorDisplayName'],
                    'text': comment['textDisplay'],
                    'likes': comment['likeCount'],
                    'published_at': comment['publishedAt']
                })
            
            next_page_token = comment_response.get('nextPageToken')
            if not next_page_token or len(comments) >= 500:  # Limit to 500 comments
                break
        
        return comments, video_info
        
    except Exception as e:
        return None, str(e)

def predict_toxicity(text):
    """Predict toxicity for a given text"""
    if model is None or vectorizer is None:
        return None
    
    try:
        # Vectorize the text
        vectorized_text = vectorizer([text])
        
        # Make prediction
        prediction = model.predict(vectorized_text, verbose=0)
        
        # Define toxicity categories
        categories = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']
        
        # Create results
        results = {}
        for i, category in enumerate(categories):
            results[category] = float(prediction[0][i])
        
        # Determine if comment is toxic (lower threshold: 0.3)
        is_toxic = any(score > 0.4 for score in results.values())
        max_toxicity = max(results.values())
        
        return {
            'is_toxic': is_toxic,
            'max_toxicity_score': max_toxicity,
            'scores': results
        }
        
    except Exception as e:
        print(f"Error predicting toxicity: {e}")
        return None

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    """Analyze YouTube video comments for toxicity"""
    try:
        data = request.get_json()
        video_url = data.get('video_url')
        
        if not video_url:
            return jsonify({'error': 'Video URL is required'}), 400
        
        # Extract video ID
        video_id = extract_video_id(video_url)
        if not video_id:
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        # Get comments from YouTube
        comments, video_info = get_youtube_comments(video_id)
        
        if comments is None:
            return jsonify({'error': f'Failed to fetch comments: {video_info}'}), 400
        
        # Analyze each comment
        toxic_comments = []
        total_comments = len(comments)
        
        print(f"Analyzing {total_comments} comments...")
        
        for i, comment in enumerate(comments):
            toxicity_result = predict_toxicity(comment['text'])
            if toxicity_result:
                if toxicity_result['is_toxic']:
                    comment['toxicity_analysis'] = toxicity_result
                    toxic_comments.append(comment)
                    print(f"Toxic comment {i+1}: {comment['text'][:50]}... (max score: {toxicity_result['max_toxicity_score']:.3f})")
                elif i < 5:  # Show first 5 non-toxic comments for debugging
                    print(f"Non-toxic comment {i+1}: {comment['text'][:50]}... (max score: {toxicity_result['max_toxicity_score']:.3f})")
        
        # Prepare response
        response = {
            'video_info': {
                'title': video_info['snippet']['title'],
                'channel': video_info['snippet']['channelTitle'],
                'view_count': video_info['statistics'].get('viewCount', 0),
                'comment_count': video_info['statistics'].get('commentCount', 0)
            },
            'analysis_summary': {
                'total_comments_analyzed': total_comments,
                'toxic_comments_found': len(toxic_comments),
                'toxicity_percentage': round((len(toxic_comments) / total_comments) * 100, 2) if total_comments > 0 else 0
            },
            'toxic_comments': toxic_comments
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/test-comment', methods=['POST'])
def test_comment():
    """Test a single comment for toxicity"""
    try:
        data = request.get_json()
        comment_text = data.get('comment')
        
        if not comment_text:
            return jsonify({'error': 'Comment text is required'}), 400
        
        toxicity_result = predict_toxicity(comment_text)
        
        if toxicity_result is None:
            return jsonify({'error': 'Failed to analyze comment'}), 500
        
        return jsonify({
            'comment': comment_text,
            'analysis': toxicity_result
        })
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'vectorizer_loaded': vectorizer is not None
    })

if __name__ == '__main__':
    # Load model on startup
    load_model_and_vectorizer()
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000) 