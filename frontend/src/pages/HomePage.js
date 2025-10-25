import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, AlertTriangle, Users, CheckCircle, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }}></div>
        <p style={{ marginTop: '1rem', color: '#a0a0a0' }}>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      icon: Shield,
      label: 'Total Reports',
      value: stats?.total_reports || 0,
      color: '#00ff85',
      testId: 'total-reports-stat'
    },
    {
      icon: AlertTriangle,
      label: 'Confirmed Scams',
      value: stats?.confirmed_scams || 0,
      color: '#ef4444',
      testId: 'confirmed-scams-stat'
    },
    {
      icon: CheckCircle,
      label: 'Pending Reports',
      value: stats?.pending_reports || 0,
      color: '#ffc107',
      testId: 'pending-reports-stat'
    },
    {
      icon: TrendingUp,
      label: 'Total Votes',
      value: stats?.total_votes || 0,
      color: '#a855f7',
      testId: 'total-votes-stat'
    },
    {
      icon: Users,
      label: 'Active Reporters',
      value: stats?.unique_reporters || 0,
      color: '#3b82f6',
      testId: 'active-reporters-stat'
    },
  ];

  return (
    <div className="page-container" data-testid="home-page">
      <div className="page-header">
        <h1 className="page-title" data-testid="page-title">PhishBlock Dashboard</h1>
        <p className="page-subtitle" data-testid="page-subtitle">
          Decentralized Anti-Phishing Database - Community-Driven Security
        </p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card" data-testid={stat.testId}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Icon size={32} style={{ color: stat.color, filter: `drop-shadow(0 0 8px ${stat.color}80)` }} />
              </div>
              <div className="stat-value" data-testid={`${stat.testId}-value`}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card" data-testid="about-card">
          <h3 className="card-title">About PhishBlock</h3>
          <div className="card-content">
            <p style={{ marginBottom: '1rem' }}>
              PhishBlock is a decentralized, transparent, and community-governed registry of phishing URLs
              and scam wallet addresses powered by blockchain technology.
            </p>
            <p>
              Our platform empowers users to report, validate, and access phishing information without
              relying on a central authority, protecting the Web3 ecosystem from scams.
            </p>
          </div>
        </div>

        <div className="card" data-testid="features-card">
          <h3 className="card-title">Key Features</h3>
          <div className="card-content">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00ff85' }}>✓</span> Blockchain-based transparency
              </li>
              <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00ff85' }}>✓</span> Community-driven validation
              </li>
              <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00ff85' }}>✓</span> ML-powered phishing detection
              </li>
              <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00ff85' }}>✓</span> Real-time scam reporting
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00ff85' }}>✓</span> Decentralized governance
              </li>
            </ul>
          </div>
        </div>

        <div className="card" data-testid="how-it-works-card">
          <h3 className="card-title">How It Works</h3>
          <div className="card-content">
            <ol style={{ paddingInlineStart: '1.5rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>Connect your Web3 wallet (MetaMask)</li>
              <li style={{ marginBottom: '0.75rem' }}>Report suspicious URLs or wallet addresses</li>
              <li style={{ marginBottom: '0.75rem' }}>Community votes on report validity</li>
              <li style={{ marginBottom: '0.75rem' }}>Reports get confirmed on-chain</li>
              <li>Access verified scam database</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;