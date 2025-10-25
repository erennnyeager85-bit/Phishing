# PhishBlock Smart Contract

## Setup

1. Install dependencies:
```bash
cd /app/contracts
npm install
```

2. Create a `.env` file in the contracts directory:
```
DEPLOYER_PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

3. Deploy to Polygon Mumbai testnet:
```bash
npm run deploy:mumbai
```

4. Verify on PolygonScan:
```bash
npm run verify -- CONTRACT_ADDRESS
```

## Contract Address
After deployment, update the contract address in `/app/frontend/src/config/contract.js`

## Getting Test MATIC
Get Mumbai testnet MATIC from: https://faucet.polygon.technology/

## Important Notes
- Never commit your private key to version control
- The contract stores URL hashes (not actual URLs) for privacy
- Minimum 3 upvotes required to confirm a scam
- Users can only vote once per report