import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, ExternalLink, Clock, User, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ExplorePage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, confirmed, pending
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, reports]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API}/reports`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Apply status filter
    if (filter === 'confirmed') {
      filtered = filtered.filter(r => r.confirmed_scam);
    } else if (filter === 'pending') {
      filtered = filtered.filter(r => !r.confirmed_scam);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reporter_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
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
        <p style={{ marginTop: '1rem', color: '#a0a0a0' }}>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="page-container" data-testid="explore-page">
      <div className="page-header">
        <h1 className="page-title" data-testid="page-title">Explore Reports</h1>
        <p className="page-subtitle" data-testid="page-subtitle">
          Browse and search through community-reported phishing URLs
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }} data-testid="filters-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#a0a0a0'
              }} 
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search by URL or reporter address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '3rem' }}
              data-testid="search-input"
            />
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
              data-testid="filter-all-btn"
            >
              <Filter size={18} />
              All Reports ({reports.length})
            </Button>
            <Button
              onClick={() => setFilter('confirmed')}
              className={filter === 'confirmed' ? 'btn-primary' : 'btn-secondary'}
              data-testid="filter-confirmed-btn"
            >
              <Shield size={18} />
              Confirmed ({reports.filter(r => r.confirmed_scam).length})
            </Button>
            <Button
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'btn-primary' : 'btn-secondary'}
              data-testid="filter-pending-btn"
            >
              <Clock size={18} />
              Pending ({reports.filter(r => !r.confirmed_scam).length})
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '1rem', color: '#a0a0a0' }} data-testid="results-count">
        Showing {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }} data-testid="no-reports-message">
          <Shield size={48} style={{ color: '#a0a0a0', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#e0e0e0', marginBottom: '0.5rem' }}>No Reports Found</h3>
          <p style={{ color: '#a0a0a0' }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredReports.map((report) => (
            <div 
              key={report.id} 
              className="card"
              style={{
                borderColor: report.confirmed_scam 
                  ? 'rgba(239, 68, 68, 0.3)' 
                  : 'rgba(0, 255, 133, 0.2)'
              }}
              data-testid="report-card"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ 
                        color: '#e0e0e0', 
                        fontSize: '1rem', 
                        wordBreak: 'break-all',
                        fontFamily: 'monospace'
                      }} data-testid="report-url">
                        {report.url}
                      </h3>
                      <a 
                        href={report.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#a855f7' }}
                        data-testid="external-link"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#a0a0a0', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={14} />
                        {formatAddress(report.reporter_address)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} />
                        {formatDate(report.timestamp)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span 
                      className={`badge ${report.confirmed_scam ? 'badge-danger' : 'badge-warning'}`}
                      data-testid="report-status-badge"
                    >
                      {report.confirmed_scam ? 'CONFIRMED SCAM' : 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* ML Score */}
                {report.phishing_score !== null && (
                  <div style={{ 
                    background: 'rgba(168, 85, 247, 0.1)', 
                    borderRadius: '8px', 
                    padding: '0.75rem',
                    border: '1px solid rgba(168, 85, 247, 0.2)'
                  }} data-testid="ml-score-section">
                    <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>ML Phishing Score: </span>
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#a855f7' }} data-testid="ml-score-value">
                      {report.phishing_score}%
                    </span>
                  </div>
                )}

                {/* Description */}
                {report.description && (
                  <div style={{ 
                    borderTop: '1px solid rgba(0, 255, 133, 0.1)', 
                    paddingTop: '1rem',
                    color: '#c0c0c0',
                    fontSize: '0.95rem',
                    lineHeight: '1.6'
                  }} data-testid="report-description">
                    {report.description}
                  </div>
                )}

                {/* Voting Stats */}
                <div style={{ 
                  display: 'flex', 
                  gap: '2rem', 
                  borderTop: '1px solid rgba(0, 255, 133, 0.1)', 
                  paddingTop: '1rem' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={20} style={{ color: '#00ff85' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#00ff85' }} data-testid="upvotes-count">
                      {report.upvotes}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>Upvotes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingDown size={20} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ef4444' }} data-testid="downvotes-count">
                      {report.downvotes}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>Downvotes</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;