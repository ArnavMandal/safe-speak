# 🛡️ Safe-Speak: YouTube Toxicity Classifier

A full-stack web application that analyzes YouTube video comments for toxic content using a trained deep learning model. Built with the mission to spread awareness of cyberbullying and online toxicity as we move into an increasingly digital age.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.18.0-orange.svg)](https://tensorflow.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)

## � Demo Video

[Watch the demo video on Google Drive](https://drive.google.com/file/d/1isEJUv-f5nTn1WsRIn93r1N-g0SHaB0O/view?usp=sharing)

## �🌍 Mission & Purpose

This project was created to address the growing concern of online toxicity and cyberbullying in our digital world. By combining machine learning expertise with a commitment to digital safety, we aim to:

- **Detect and analyze toxic content** across multiple categories
- **Raise awareness** about the prevalence of harmful online behavior
- **Provide insights** into digital toxicity patterns
- **Empower users** to understand and address cyberbullying
- **Promote safer online communities** through better content awareness

## 🎯 Impact

Online toxicity and cyberbullying affect millions of people worldwide, with serious consequences for mental health, digital safety, and community building. This tool helps identify and understand these issues, contributing to a more informed and safer digital environment.

## 🚀 Features

- **YouTube Integration**: Fetch comments from any YouTube video using the YouTube Data API
- **AI-Powered Analysis**: Uses a trained LSTM model to detect 6 types of toxicity:
  - Toxic
  - Severe Toxic
  - Obscene
  - Threat
  - Insult
  - Identity Hate
- **Real-time Analysis**: Test individual comments or analyze entire video comment sections
- **Beautiful UI**: Modern, responsive interface with detailed toxicity breakdowns
- **Comprehensive Results**: Shows toxicity percentages, comment details, and summary statistics

## 🏗️ Architecture

- **Frontend**: React.js with modern UI components
- **Backend**: Flask API with TensorFlow model integration
- **Model**: Bidirectional LSTM neural network (87% precision, 76% recall)
- **API**: YouTube Data API v3 for comment fetching

## 📋 Prerequisites

1. **Python 3.8+** and **Node.js 14+**
2. **YouTube Data API Key** (free from Google Cloud Console)

## 🛠️ Setup Instructions

### 1. Backend Setup

```bash
cd backend

#Activate virtual enviorment windows
.\venv\Scripts\Activate.ps1

# linux or macos
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Make sure you have the model file
ls toxicity.h5  # Should show the 74MB model file

# Start the Flask server
python app.py
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the React development server
npm start
```

The frontend will run on `http://localhost:3000`

### 3. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **YouTube Data API v3**
4. Create credentials (API Key)
5. Copy the API key

### 4. Configure Environment Variables

1. In the `backend/` directory, you should see a `.env` file
2. Replace the placeholder API key in the `.env` file with your actual YouTube API key:
   ```
   YOUTUBE_API_KEY=your_actual_api_key_here
   ```

## 🎯 Usage

### Analyze YouTube Video Comments

1. Open the app in your browser (`http://localhost:3000`)
2. Paste a YouTube video URL (e.g., `https://www.youtube.com/watch?v=...`)
3. Click "Analyze Comments"
4. View results showing:
   - Video information (title, channel, views)
   - Analysis summary (total comments, toxic count, toxicity percentage)
   - Detailed list of toxic comments with toxicity scores

### Test Individual Comments

1. Use the "Test Single Comment" section
2. Enter any text you want to analyze
3. Click "Test Comment"
4. See toxicity breakdown with category scores

## 📊 Model Performance

- **Precision**: 87.2%
- **Recall**: 76.4%
- **Training Data**: Jigsaw Toxic Comment Classification Challenge
- **Architecture**: Bidirectional LSTM with embedding layer

## 🔧 API Endpoints

### `POST /api/analyze-video`
Analyze all comments from a YouTube video

**Request:**
```json
{
  "video_url": "https://www.youtube.com/watch?v=..."
}
```

**Note:** The YouTube API key is now stored in the `.env` file in the backend directory.

**Response:**
```json
{
  "video_info": {
    "title": "Video Title",
    "channel": "Channel Name",
    "view_count": "1000000",
    "comment_count": "5000"
  },
  "analysis_summary": {
    "total_comments_analyzed": 500,
    "toxic_comments_found": 25,
    "toxicity_percentage": 5.0
  },
  "toxic_comments": [...]
}
```

### `POST /api/test-comment`
Test a single comment for toxicity

**Request:**
```json
{
  "comment": "Your comment text here"
}
```

### `GET /api/health`
Health check endpoint

## 🚨 Important Notes

- **API Quotas**: YouTube Data API has daily quotas. The app limits to 500 comments per video
- **Model Loading**: The 74MB model takes a few seconds to load on startup
- **Rate Limiting**: Be mindful of YouTube API rate limits
- **Privacy**: API keys are stored locally and not transmitted to external servers

## 🐛 Troubleshooting

### Common Issues

1. **"Model not loaded" error**
   - Ensure `toxicity.h5` is in the `backend/` directory
   - Check file size (should be ~74MB)

2. **YouTube API errors**
   - Verify API key is correct
   - Check if YouTube Data API v3 is enabled
   - Ensure you haven't exceeded daily quotas

3. **CORS errors**
   - Make sure backend is running on port 5000
   - Check that frontend proxy is configured correctly

4. **Missing dependencies**
   - Run `pip install -r requirements.txt` in backend
   - Run `npm install` in frontend

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/ArnavMandal/safe-speak.git
cd safe-speak

# Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python app.py

# Frontend Setup (in a new terminal)
cd frontend
npm install
npm start
```

## 📁 Project Structure

```
safe-speak/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── model.ipynb         # Model training notebook
│   ├── toxicity.h5         # Trained model (74MB)
│   └── jigsaw-toxic-comment-classification-challenge/
│       └── train.csv       # Training dataset
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .gitignore              # Git ignore rules
└── README.md
```


## 📄 License

This project is for educational purposes. Please respect YouTube's terms of service and API usage guidelines. 