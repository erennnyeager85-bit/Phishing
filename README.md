# PhishBlock - Decentralized Anti-Phishing Database

![PhishBlock Logo](https://img.shields.io/badge/PhishBlock-Blockchain%20Security-00ff85?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20FastAPI%20%7C%20Solidity-a855f7?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-MVP%20Ready-00ff85?style=for-the-badge)

## 🎯 Overview

PhishBlock is a **decentralized, transparent, and community-governed registry** of phishing URLs and scam wallet addresses powered by blockchain technology. It empowers users to report, validate, and access phishing information without relying on a central authority, protecting the Web3 ecosystem from scams.

## ✨ Key Features

- **🔗 Blockchain-Based Transparency**: All reports stored on Polygon Mumbai testnet
- **👥 Community-Driven Validation**: Decentralized voting system for report verification
- **🤖 ML-Powered Phishing Detection**: Real-time URL analysis using machine learning
- **⚡ Real-Time Scam Reporting**: Instant submission and verification
- **🗳️ Decentralized Governance**: Community votes to confirm phishing reports
- **🔒 Wallet-Based Authentication**: Connect via MetaMask for secure reporting

## 🏗️ Architecture

```
┌──────────────────────────┐
│     Frontend (React)      │
│   + Tailwind CSS          │
│   + Wagmi/Ethers.js       │
│   + RainbowKit            │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   Backend (FastAPI)       │
│   + MongoDB               │
│   + ML Engine             │
│   + RESTful APIs          │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│  Smart Contract          │
│  (Solidity)              │
│  Polygon Mumbai Testnet  │
└──────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Python 3.11+
- MongoDB
- MetaMask wallet
- Polygon Mumbai testnet MATIC

### Services are already running!

The application is live and running:
- Frontend: Check your domain
- Backend API: Available at /api endpoints
- MongoDB: Running locally

### Smart Contract Deployment

```bash
cd contracts
npm install
npm run deploy:mumbai
```

After deployment, update the contract address in:
`/app/frontend/src/config/contract.js`

## 📱 Application Pages

### 🏠 Dashboard
- View real-time statistics
- Total reports, confirmed scams, pending reports
- Active reporters and total votes

### 📝 Report Page
- Submit phishing URL or wallet address reports
- ML-powered analysis before submission
- Connect wallet to submit reports

### 🔍 Explore Page
- Browse all community reports
- Filter by status (All, Confirmed, Pending)
- Search by URL or reporter address

### 🗳️ Vote Page
- Review pending reports
- Vote "Scam" or "Safe" on reports
- Reports confirmed after 3+ upvotes

### 🧠 ML Analyzer
- Analyze any URL for phishing probability
- Real-time risk scoring
- Feature breakdown and analysis

## 🧠 ML Phishing Detection

The ML engine analyzes URLs based on:
- URL structure and length
- Domain characteristics
- Suspicious keywords (login, verify, secure, etc.)
- TLD reputation (.tk, .ml, .ga, etc.)
- Special character usage
- HTTPS presence
- IP address usage

### Risk Levels
- **HIGH** (70%+): Strong phishing indicators
- **MEDIUM** (40-69%): Suspicious characteristics
- **LOW** (<40%): Relatively safe

## 📊 API Endpoints

### ML Analysis
```bash
POST /api/ml/analyze
Body: {"url": "https://example.com"}
```

### Report Management
```bash
# Create report
POST /api/reports
Body: {"url": "...", "reporter_address": "0x...", "description": "..."}

# Get reports
GET /api/reports?status=pending

# Vote on report
POST /api/reports/vote
Body: {"report_id": "...", "voter_address": "0x...", "is_scam": true}
```

### Statistics
```bash
GET /api/stats
```

## 🔐 Smart Contract

Located in `/app/contracts/PhishBlock.sol`

### Main Functions:
- `submitReport(string _urlHash)` - Submit new phishing report
- `vote(uint256 _reportId, bool _isScam)` - Vote on report
- `getReport(uint256 _reportId)` - Get report details
- `hasVoted(uint256 _reportId, address _voter)` - Check voting status

## 🎨 Design Theme

**Dark Cybersecurity Theme**:
- Base: Black (#0a0a0a) to navy (#1a1a2e)
- Primary: Neon green (#00ff85)
- Secondary: Purple (#a855f7)
- Accent: Red (#ef4444) for high-risk alerts
- Fonts: Space Grotesk (headings), Inter (body)

## 📈 Future Enhancements

- [ ] Token rewards for reporters and validators
- [ ] Full DAO governance system
- [ ] Cross-chain support
- [ ] Browser extension
- [ ] Mobile app
- [ ] Advanced ML models
- [ ] Reputation system

---

**Built with ❤️ for a safer Web3 ecosystem**

🛡️ Stay Safe, Stay Secure with PhishBlock
