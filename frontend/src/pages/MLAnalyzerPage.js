import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Brain, Search, Loader, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MLAnalyzerPage = () => {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await axios.post(`${API}/ml/analyze`, { url });
      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing URL:', error);
      toast.error('Failed to analyze URL');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' };
      case 'MEDIUM':
        return { bg: 'rgba(255, 193, 7, 0.1)', border: 'rgba(255, 193, 7, 0.3)', text: '#ffc107' };
      case 'LOW':
        return { bg: 'rgba(0, 255, 133, 0.1)', border: 'rgba(0, 255, 133, 0.3)', text: '#00ff85' };
      default:
        return { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' };
    }
  };

  return (
    <div className="page-container" data-testid="ml-analyzer-page">
      <div className="page-header">
        <h1 className="page-title" data-testid="page-title">ML Phishing Analyzer</h1>
        <p className="page-subtitle" data-testid="page-subtitle">
          Use machine learning to detect phishing URLs in real-time
        </p>
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginBottom: '2rem' }} data-testid="info-card">
        <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
          <Info size={24} style={{ color: '#a855f7', flexShrink: 0, marginTop: '0.25rem' }} />
          <div>
            <h3 className="card-title">How It Works</h3>
            <div className="card-content">
              <p style={{ marginBottom: '0.75rem' }}>
                Our ML model analyzes various features of the URL including:
              </p>
              <ul style={{ listStyle: 'disc', paddingInlineStart: '1.5rem' }}>
                <li>URL structure and length</li>
                <li>Domain characteristics</li>
                <li>Suspicious keywords and patterns</li>
                <li>TLD (Top-Level Domain) reputation</li>
                <li>Special character usage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Analyzer Form */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }} data-testid="analyzer-form-card">
        <form onSubmit={handleAnalyze}>
          <div className="form-group">
            <label className="form-label" htmlFor="analyze-url" data-testid="url-label">
              Enter URL to Analyze
            </label>
            <input
              type="text"
              id="analyze-url"
              className="form-input"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={analyzing}
              data-testid="url-input"
            />
          </div>

          <Button
            type="submit"
            disabled={analyzing}
            className="btn-primary"
            style={{ width: '100%', padding: '1rem' }}
            data-testid="analyze-btn"
          >
            {analyzing ? (
              <>
                <Loader className="loading-spinner" size={18} />
                Analyzing URL...
              </>
            ) : (
              <>
                <Search size={18} />
                Analyze URL
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div 
          className="card" 
          style={{ 
            maxWidth: '800px', 
            margin: '2rem auto 0',
            background: getRiskColor(result.risk_level).bg,
            borderColor: getRiskColor(result.risk_level).border
          }}
          data-testid="results-card"
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {result.risk_level === 'HIGH' ? (
              <AlertTriangle size={64} style={{ color: getRiskColor(result.risk_level).text, margin: '0 auto' }} />
            ) : result.risk_level === 'MEDIUM' ? (
              <Info size={64} style={{ color: getRiskColor(result.risk_level).text, margin: '0 auto' }} />
            ) : (
              <CheckCircle size={64} style={{ color: getRiskColor(result.risk_level).text, margin: '0 auto' }} />
            )}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#e0e0e0' }}>Analysis Results</h3>
            <p style={{ color: '#a0a0a0', wordBreak: 'break-all', fontFamily: 'monospace' }} data-testid="analyzed-url">
              {result.url}
            </p>
          </div>

          {/* Score Display */}
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            background: 'rgba(26, 26, 46, 0.6)',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <p style={{ fontSize: '0.9rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>Phishing Probability</p>
            <p style={{ 
              fontSize: '4rem', 
              fontWeight: '700',
              color: getRiskColor(result.risk_level).text,
              lineHeight: '1'
            }} data-testid="phishing-probability">
              {result.phishing_probability}%
            </p>
            <span 
              className={`badge ${
                result.risk_level === 'HIGH' ? 'badge-danger' : 
                result.risk_level === 'MEDIUM' ? 'badge-warning' : 'badge-success'
              }`}
              style={{ fontSize: '1.1rem', padding: '0.5rem 1.5rem', marginTop: '1rem' }}
              data-testid="risk-level-badge"
            >
              {result.risk_level} RISK
            </span>
          </div>

          {/* Features Breakdown */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#e0e0e0' }}>Feature Analysis</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(result.features).map(([key, value]) => (
                <div 
                  key={key}
                  style={{
                    background: 'rgba(26, 26, 46, 0.6)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 255, 133, 0.1)'
                  }}
                  data-testid="feature-item"
                >
                  <p style={{ fontSize: '0.8rem', color: '#a0a0a0', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e0e0e0' }}>
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div style={{ 
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(26, 26, 46, 0.6)',
            borderRadius: '12px',
            borderLeft: `4px solid ${getRiskColor(result.risk_level).text}`
          }} data-testid="recommendation-section">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#e0e0e0' }}>Recommendation</h4>
            <p style={{ color: '#c0c0c0', lineHeight: '1.6' }}>
              {result.risk_level === 'HIGH' && (
                'This URL shows strong indicators of being a phishing site. We strongly recommend avoiding this link and reporting it if you haven\'t already.'
              )}
              {result.risk_level === 'MEDIUM' && (
                'This URL shows some suspicious characteristics. Exercise caution and verify the authenticity before proceeding. Consider reporting if you believe it\'s malicious.'
              )}
              {result.risk_level === 'LOW' && (
                'This URL appears to be relatively safe based on our analysis. However, always exercise caution when sharing sensitive information online.'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="card" style={{ marginTop: '2rem' }} data-testid="examples-card">
        <h3 className="card-title">Try These Examples</h3>
        <div className="card-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setUrl('https://secur3-bank-login.tk/verify')}
              className="btn-secondary"
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              data-testid="example-high-risk"
            >
              High Risk: https://secur3-bank-login.tk/verify
            </button>
            <button
              onClick={() => setUrl('https://account-update-required.xyz/login?user=123')}
              className="btn-secondary"
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              data-testid="example-medium-risk"
            >
              Medium Risk: https://account-update-required.xyz/login?user=123
            </button>
            <button
              onClick={() => setUrl('https://github.com')}
              className="btn-secondary"
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              data-testid="example-low-risk"
            >
              Low Risk: https://github.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLAnalyzerPage;