import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { WagmiConfig, useAccount, useConnect, useDisconnect } from 'wagmi';
import { config } from './config/wagmi';
import axios from "axios";
import "@/App.css";
import { Toaster, toast } from 'sonner';
import { Shield, Home, FileText, Vote, Brain, Menu, X, Wallet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import ExplorePage from './pages/ExplorePage';
import VotePage from './pages/VotePage';
import MLAnalyzerPage from './pages/MLAnalyzerPage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const location = useLocation();

  const handleConnect = () => {
    const injectedConnector = connectors.find(c => c.name === 'MetaMask');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/report', label: 'Report', icon: FileText },
    { path: '/explore', label: 'Explore', icon: Shield },
    { path: '/vote', label: 'Vote', icon: Vote },
    { path: '/analyzer', label: 'ML Analyzer', icon: Brain },
  ];

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link to="/" className="logo-link" data-testid="logo-link">
          <Shield className="logo-icon" />
          <span className="logo-text">PhishBlock</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links-desktop">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Wallet Button */}
        <div className="wallet-section">
          {isConnected ? (
            <Button
              onClick={() => disconnect()}
              className="wallet-btn connected"
              data-testid="disconnect-wallet-btn"
            >
              <Wallet size={18} />
              <span className="wallet-address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              className="wallet-btn"
              data-testid="connect-wallet-btn"
            >
              <Wallet size={18} />
              Connect Wallet
            </Button>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="nav-links-mobile" data-testid="mobile-nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link-mobile ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

function AppContent() {
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/analyzer" element={<MLAnalyzerPage />} />
        </Routes>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}

function App() {
  return (
    <WagmiConfig config={config}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </WagmiConfig>
  );
}

export default App;