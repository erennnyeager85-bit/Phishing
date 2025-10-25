import React, { useState } from 'react';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { AlertCircle, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReportPage = () => {
  const { address, isConnected } = useAccount();
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [phishingScore, setPhishingScore] = useState(null);

  const handleAnalyze = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await axios.post(`${API}/ml/analyze`, { url });
      setPhishingScore(response.data);
      toast.success('URL analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing URL:', error);
      toast.error('Failed to analyze URL');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/reports`, {
        url,
        reporter_address: address,
        description: description || null,
      });

      toast.success('Report submitted successfully!');
      setUrl('');
      setDescription('');
      setPhishingScore(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" data-testid="report-page">
      <div className="page-header">
        <h1 className="page-title" data-testid="page-title">Report Phishing URL</h1>
        <p className="page-subtitle" data-testid="page-subtitle">
          Help protect the community by reporting suspicious URLs and wallet addresses
        </p>
      </div>

      {!isConnected && (
        <div 
          className="card" 
          style={{ 
            marginBottom: '2rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderColor: 'rgba(239, 68, 68, 0.3)' 
          }}
          data-testid="wallet-warning"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertCircle size={24} style={{ color: '#ef4444' }} />
            <div>
              <h3 style={{ color: '#ef4444', marginBottom: '0.25rem' }}>Wallet Not Connected</h3>
              <p style={{ color: '#fca5a5', fontSize: '0.9rem' }}>
                Please connect your wallet to submit a report
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }} data-testid="report-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="url" data-testid="url-label">
              URL or Wallet Address *
            </label>
            <input
              type="text"
              id="url"
              className="form-input"
              placeholder="https://suspicious-site.com or 0x..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              data-testid="url-input"
            />
            <div style={{ marginTop: '0.75rem' }}>
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || !url}
                className="btn-secondary"
                style={{ width: '100%' }}
                data-testid="analyze-btn"
              >
                {analyzing ? (
                  <>
                    <Loader className="loading-spinner" size={18} />
                    Analyzing...
                  </>
                ) : (
                  'Analyze with ML'
                )}
              </Button>
            </div>
          </div>

          {phishingScore && (
            <div 
              className="card" 
              style={{ 
                marginBottom: '1.5rem',
                background: phishingScore.risk_level === 'HIGH' 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : phishingScore.risk_level === 'MEDIUM' 
                  ? 'rgba(255, 193, 7, 0.1)' 
                  : 'rgba(0, 255, 133, 0.1)',
                borderColor: phishingScore.risk_level === 'HIGH' 
                  ? 'rgba(239, 68, 68, 0.3)' 
                  : phishingScore.risk_level === 'MEDIUM' 
                  ? 'rgba(255, 193, 7, 0.3)' 
                  : 'rgba(0, 255, 133, 0.3)'
              }}
              data-testid="phishing-score-card"
            >
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>ML Analysis Result</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', color: '#a0a0a0', marginBottom: '0.25rem' }}>Phishing Probability</p>
                  <p style={{ fontSize: '2rem', fontWeight: '700' }} data-testid="phishing-probability">
                    {phishingScore.phishing_probability}%
                  </p>
                </div>
                <div>
                  <span 
                    className={`badge ${phishingScore.risk_level === 'HIGH' ? 'badge-danger' : phishingScore.risk_level === 'MEDIUM' ? 'badge-warning' : 'badge-success'}`}
                    style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
                    data-testid="risk-level-badge"
                  >
                    {phishingScore.risk_level} RISK
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="description" data-testid="description-label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="form-textarea"
              placeholder="Provide additional details about why this URL is suspicious..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={4}
              data-testid="description-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !isConnected}
            className="btn-primary"
            style={{ width: '100%', padding: '1rem' }}
            data-testid="submit-report-btn"
          >
            {loading ? (
              <>
                <Loader className="loading-spinner" size={18} />
                Submitting Report...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '2rem', maxWidth: '800px', margin: '2rem auto 0' }} data-testid="guidelines-card">
        <h3 className="card-title">Reporting Guidelines</h3>
        <div className="card-content">
          <ul style={{ listStyle: 'disc', paddingInlineStart: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Only report URLs or wallet addresses you genuinely believe are involved in phishing or scams</li>
            <li style={{ marginBottom: '0.5rem' }}>Provide accurate information to help the community verify the report</li>
            <li style={{ marginBottom: '0.5rem' }}>Your wallet address will be recorded as the reporter</li>
            <li style={{ marginBottom: '0.5rem' }}>False reporting may affect your reputation in the community</li>
            <li>All reports are stored on-chain for transparency</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;