// Contract configuration
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // UPDATE THIS AFTER DEPLOYMENT

export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "reportId", "type": "uint256"},
      {"indexed": false, "name": "urlHash", "type": "string"}
    ],
    "name": "ReportConfirmed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "uint256"},
      {"indexed": false, "name": "urlHash", "type": "string"},
      {"indexed": true, "name": "reporter", "type": "address"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "ReportSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "reportId", "type": "uint256"},
      {"indexed": true, "name": "voter", "type": "address"},
      {"indexed": false, "name": "isScam", "type": "bool"}
    ],
    "name": "VoteCasted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CONFIRMATION_THRESHOLD",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_reportId", "type": "uint256"}, {"name": "_voter", "type": "address"}],
    "name": "hasVoted",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_urlHash", "type": "string"}],
    "name": "isReported",
    "outputs": [{"name": "", "type": "bool"}, {"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "reportCount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_urlHash", "type": "string"}],
    "name": "submitReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_reportId", "type": "uint256"}, {"name": "_isScam", "type": "bool"}],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_reportId", "type": "uint256"}],
    "name": "getReport",
    "outputs": [
      {"name": "id", "type": "uint256"},
      {"name": "urlHash", "type": "string"},
      {"name": "reporter", "type": "address"},
      {"name": "upvotes", "type": "uint256"},
      {"name": "downvotes", "type": "uint256"},
      {"name": "confirmedScam", "type": "bool"},
      {"name": "timestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Polygon Mumbai RPC
export const MUMBAI_RPC_URL = "https://rpc-mumbai.maticvigil.com";
export const MUMBAI_CHAIN_ID = 80001;

// Network config for Wagmi
export const MUMBAI_NETWORK = {
  id: MUMBAI_CHAIN_ID,
  name: 'Polygon Mumbai',
  network: 'mumbai',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    default: { http: [MUMBAI_RPC_URL] },
    public: { http: [MUMBAI_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://mumbai.polygonscan.com' },
  },
  testnet: true,
};