import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { ThumbsUp, ThumbsDown, Loader, AlertCircle, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VotePage = () => {
  const { address, isConnected } = useAccount();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const fetchPendingReports = async () => {
    try {
      const response = await axios.get(`${API}/reports?status=pending`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reportId, isScam) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setVotingId(reportId);
    try {
      const response = await axios.post(`${API}/reports/vote`, {
        report_id: reportId,
        voter_address: address,
        is_scam: isScam,
      });

      toast.success(`Vote recorded successfully! ${response.data.confirmed_scam ? 'Report confirmed as scam.' : ''}`);
      
      // Refresh reports
      await fetchPendingReports();
    } catch (error) {
      console.error('Error voting:', error);
      if (error.response?.status === 400) {
        toast.error('You have already voted on this report');
      } else {
        toast.error('Failed to record vote');
      }
    } finally {
      setVotingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }}></div>
        <p style={{ marginTop: '1rem', color: '#a0a0a0' }}>Loading pending reports...</p>
      </div>
    );
  }

  return (
    <div className="page-container" data-testid="vote-page">
      <div className="page-header">
        <h1 className="page-title" data-testid="page-title">Vote on Reports</h1>
        <p className="page-subtitle" data-testid="page-subtitle">
          Help validate phishing reports by voting on their legitimacy
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
                Please connect your wallet to vote on reports
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }} data-testid="voting-info">
        <h3 className="card-title">How Voting Works</h3>
        <div className="card-content">
          <ul style={{ listStyle: 'disc', paddingInlineStart: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Vote "Scam" if you believe the URL is phishing or malicious</li>
            <li style={{ marginBottom: '0.5rem' }}>Vote "Safe" if you believe the report is incorrect</li>
            <li style={{ marginBottom: '0.5rem' }}>You can only vote once per report</li>
            <li style={{ marginBottom: '0.5rem' }}>Reports need 3+ scam votes to be confirmed</li>
            <li>Confirmed reports are permanently marked on-chain</li>
          </ul>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }} data-testid="no-pending-reports">
          <Clock size={48} style={{ color: '#a0a0a0', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#e0e0e0', marginBottom: '0.5rem' }}>No Pending Reports</h3>
          <p style={{ color: '#a0a0a0' }}>All reports have been reviewed. Check back later!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {reports.map((report) => (
            <div key={report.id} className="card" data-testid="vote-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* URL */}
                <div>
                  <h3 style={{ 
                    color: '#e0e0e0', 
                    fontSize: '1.1rem', 
                    marginBottom: '0.5rem',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace'
                  }} data-testid="report-url">
                    {report.url}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#a0a0a0', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User size={14} />
                      Reported by: {formatAddress(report.reporter_address)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      {formatDate(report.timestamp)}
                    </span>
                  </div>
                </div>

                {/* ML Score */}
                {report.phishing_score !== null && (
                  <div style={{ 
                    background: report.phishing_score >= 70 
                      ? 'rgba(239, 68, 68, 0.1)' 
                      : report.phishing_score >= 40 
                      ? 'rgba(255, 193, 7, 0.1)' 
                      : 'rgba(0, 255, 133, 0.1)',
                    borderRadius: '8px', 
                    padding: '0.75rem',
                    border: `1px solid ${report.phishing_score >= 70 
                      ? 'rgba(239, 68, 68, 0.3)' 
                      : report.phishing_score >= 40 
                      ? 'rgba(255, 193, 7, 0.3)' 
                      : 'rgba(0, 255, 133, 0.3)'}`
                  }} data-testid="ml-score-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>ML Phishing Score</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700' }} data-testid="ml-score-value">
                          {report.phishing_score}%
                        </span>
                        <span 
                          className={`badge ${
                            report.phishing_score >= 70 ? 'badge-danger' : 
                            report.phishing_score >= 40 ? 'badge-warning' : 'badge-success'
                          }`}
                        >
                          {report.phishing_score >= 70 ? 'HIGH' : report.phishing_score >= 40 ? 'MEDIUM' : 'LOW'} RISK
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {report.description && (
                  <div style={{ 
                    background: 'rgba(26, 26, 46, 0.4)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: '#c0c0c0',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    borderLeft: '3px solid rgba(0, 255, 133, 0.3)'
                  }} data-testid="report-description">
                    <strong style={{ color: '#e0e0e0' }}>Reporter's Note:</strong><br />
                    {report.description}
                  </div>
                )}

                {/* Current Votes */}
                <div style={{ 
                  display: 'flex', 
                  gap: '2rem', 
                  padding: '1rem',
                  background: 'rgba(26, 26, 46, 0.4)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ThumbsUp size={20} style={{ color: '#00ff85' }} />
                    <span style={{ fontSize: '1.5rem', fontWeight: '600', color: '#00ff85' }} data-testid="upvotes-count">
                      {report.upvotes}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>Scam votes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ThumbsDown size={20} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ef4444' }} data-testid="downvotes-count">
                      {report.downvotes}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>Safe votes</span>
                  </div>
                </div>

                {/* Vote Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <Button
                    onClick={() => handleVote(report.id, true)}
                    disabled={votingId === report.id || !isConnected}
                    className="btn-primary"
                    style={{ flex: 1 }}
                    data-testid="vote-scam-btn"
                  >
                    {votingId === report.id ? (
                      <Loader className="loading-spinner" size={18} />
                    ) : (
                      <ThumbsUp size={18} />
                    )}
                    Vote Scam
                  </Button>
                  <Button
                    onClick={() => handleVote(report.id, false)}
                    disabled={votingId === report.id || !isConnected}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    data-testid="vote-safe-btn"
                  >
                    {votingId === report.id ? (
                      <Loader className="loading-spinner" size={18} />
                    ) : (
                      <ThumbsDown size={18} />
                    )}
                    Vote Safe
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VotePage;