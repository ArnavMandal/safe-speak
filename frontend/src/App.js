import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [testComment, setTestComment] = useState('');
  const [testResults, setTestResults] = useState(null);

  const analyzeVideo = async () => {
    if (!videoUrl) {
      setError('Please provide a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post('/api/analyze-video', {
        video_url: videoUrl
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze video');
    } finally {
      setLoading(false);
    }
  };

  const testSingleComment = async () => {
    if (!testComment) {
      setError('Please enter a comment to test');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/test-comment', {
        comment: testComment
      });

      setTestResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to test comment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getToxicityBadges = (scores) => {
    const categories = Object.entries(scores);
    return categories
      .filter(([_, score]) => score > 0.5)
      .map(([category, score]) => (
        <span 
          key={category} 
          className={`toxicity-badge ${category}`}
          title={`${category}: ${(score * 100).toFixed(1)}%`}
        >
          {category.replace('_', ' ')} ({(score * 100).toFixed(0)}%)
        </span>
      ));
  };

  return (
    <div className="container">
      <div className="card">
        <h1>🎥 YouTube Toxicity Classifier</h1>
        <p>Spreading awareness of cyberbullying and online toxicity through AI-powered analysis</p>
      </div>

      <div className="card">
        <h2>🌍 Our Mission</h2>
        <p>As we move into an increasingly digital age, online toxicity and cyberbullying have become serious issues affecting millions of people worldwide. This project combines machine learning expertise with a commitment to digital safety and awareness.</p>
        <p>By analyzing YouTube comments in real-time, we aim to:</p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>🔍 <strong>Detect toxic content</strong> across 6 categories: toxic, severe toxic, obscene, threats, insults, and identity hate</li>
          <li>📊 <strong>Provide insights</strong> into the prevalence of harmful content in online spaces</li>
          <li>🎯 <strong>Raise awareness</strong> about the impact of cyberbullying and online harassment</li>
          <li>💡 <strong>Empower users</strong> to understand and address digital toxicity</li>
        </ul>
      </div>

      <div className="card">
        <h2>🎯 How It Works</h2>
        <p>This AI-powered tool analyzes YouTube video comments for toxic content using advanced machine learning. Simply paste a YouTube video URL and get instant toxicity analysis with detailed breakdowns of harmful content types.</p>
      </div>

      <div className="card">
        <h2>📹 Analyze Video Comments</h2>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="videoUrl">YouTube Video URL:</label>
          <input
            id="videoUrl"
            type="text"
            className="input"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        
        <button 
          className="btn" 
          onClick={analyzeVideo} 
          disabled={loading || !videoUrl}
        >
          {loading ? 'Analyzing...' : 'Analyze Comments'}
        </button>
      </div>

      <div className="card">
        <h2>🧪 Test Single Comment</h2>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="testComment">Comment Text:</label>
          <textarea
            id="testComment"
            className="input"
            value={testComment}
            onChange={(e) => setTestComment(e.target.value)}
            placeholder="Enter a comment to test for toxicity..."
            rows="3"
          />
        </div>
        
        <button 
          className="btn" 
          onClick={testSingleComment} 
          disabled={loading || !testComment}
        >
          {loading ? 'Testing...' : 'Test Comment'}
        </button>

        {testResults && (
          <div style={{ marginTop: '20px' }}>
            <h3>Test Results:</h3>
            <div className="comment-card">
              <div className="comment-text">{testResults.comment}</div>
              <div>
                <strong>Toxicity Score: {(testResults.analysis.max_toxicity_score * 100).toFixed(1)}%</strong>
                {testResults.analysis.is_toxic && (
                  <div style={{ marginTop: '8px' }}>
                    {getToxicityBadges(testResults.analysis.scores)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="card error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="card loading">
          <div className="spinner"></div>
          <span style={{ marginLeft: '16px' }}>Processing...</span>
        </div>
      )}

      {results && (
        <div className="card">
          <h2>📊 Analysis Results</h2>
          
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-number">{results.video_info.title}</div>
              <div className="stat-label">Video Title</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{results.analysis_summary.total_comments_analyzed}</div>
              <div className="stat-label">Comments Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{results.analysis_summary.toxic_comments_found}</div>
              <div className="stat-label">Toxic Comments Found</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{results.analysis_summary.toxicity_percentage}%</div>
              <div className="stat-label">Toxicity Rate</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <strong>Channel:</strong> {results.video_info.channel}<br/>
            <strong>Views:</strong> {parseInt(results.video_info.view_count).toLocaleString()}<br/>
            <strong>Total Comments:</strong> {parseInt(results.video_info.comment_count).toLocaleString()}
          </div>

          {results.toxic_comments.length > 0 ? (
            <div>
              <h3>🚨 Toxic Comments Found:</h3>
              {results.toxic_comments.map((comment, index) => (
                <div key={index} className="comment-card">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-date">{formatDate(comment.published_at)}</span>
                  </div>
                  <div className="comment-text">{comment.text}</div>
                  <div className="comment-likes">👍 {comment.likes} likes</div>
                  <div style={{ marginTop: '8px' }}>
                    <strong>Toxicity Score: {(comment.toxicity_analysis.max_toxicity_score * 100).toFixed(1)}%</strong>
                    <div style={{ marginTop: '8px' }}>
                      {getToxicityBadges(comment.toxicity_analysis.scores)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="success">
              <strong>✅ No toxic comments found!</strong> This video appears to have a healthy comment section.
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>📚 Understanding Digital Toxicity</h2>
        <p>Cyberbullying and online toxicity can have serious real-world consequences:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
            <h4 style={{ color: '#dc3545', marginBottom: '8px' }}>Mental Health Impact</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>Online harassment can lead to anxiety, depression, and decreased self-esteem, especially among young people.</p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #fd7e14' }}>
            <h4 style={{ color: '#fd7e14', marginBottom: '8px' }}>Digital Safety</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>Understanding toxicity patterns helps create safer online environments and better content moderation.</p>
          </div>
          <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #20c997' }}>
            <h4 style={{ color: '#20c997', marginBottom: '8px' }}>Community Building</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>Identifying and addressing toxic behavior helps build more inclusive and supportive online communities.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>💡 About the Technology</h2>
        <p>This project uses advanced machine learning techniques to detect toxic content:</p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li><strong>Bidirectional LSTM Neural Network</strong> - Processes text in both directions for better understanding</li>
          <li><strong>Multi-label Classification</strong> - Detects 6 different types of toxicity simultaneously</li>
          <li><strong>Real-time Analysis</strong> - Provides instant results for immediate awareness</li>
          <li><strong>High Accuracy</strong> - 87% precision and 76% recall on toxic content detection</li>
        </ul>
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          <em>Built with ❤️ to promote digital safety and combat cyberbullying in our increasingly connected world.</em>
        </p>
      </div>
    </div>
  );
}

export default App; 