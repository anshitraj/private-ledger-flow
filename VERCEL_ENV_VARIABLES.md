# Vercel Environment Variables - Quick Reference

Copy and paste these into Vercel Project Settings → Environment Variables:

## Required Frontend Variables

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_RELAYER_URL=https://relayer.testnet.zama.org/
VITE_BACKEND_URL=https://your-backend-url.vercel.app
VITE_WALLETCONNECT_PROJECT_ID=53cdde5cc0f1e05662956d670abc5a8c
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## How to Get Each Value

1. **VITE_CONTRACT_ADDRESS**: 
   - Deploy contract using Hardhat
   - Copy address from `hardhat/deployments/address.json`

2. **VITE_SEPOLIA_RPC_URL**: 
   - Get from [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/)
   - Format: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

3. **VITE_RELAYER_URL**: 
   - Use official Zama testnet: `https://relayer.testnet.zama.org/`

4. **VITE_BACKEND_URL**: 
   - After deploying backend, use your Vercel backend URL
   - Or use Railway/Render backend URL

5. **VITE_WALLETCONNECT_PROJECT_ID**: 
   - Already set: `53cdde5cc0f1e05662956d670abc5a8c`
   - Or get new one from [WalletConnect Cloud](https://cloud.walletconnect.com)

6. **VITE_IPFS_GATEWAY**: 
   - Default: `https://gateway.pinata.cloud/ipfs/`
   - Or use any public IPFS gateway
   - **Note**: Frontend only reads from IPFS, backend handles uploads

## Backend Environment Variables (if deploying backend separately)

```env
# Pinata IPFS (REQUIRED for IPFS uploads)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Blockchain
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

## How to Get Pinata API Keys

1. Go to [Pinata](https://pinata.cloud/)
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy:
   - **API Key** → `PINATA_API_KEY`
   - **Secret API Key** → `PINATA_SECRET_API_KEY`

**Important**: 
- Pinata keys are **ONLY needed for backend** (for uploading to IPFS)
- Frontend only needs `VITE_IPFS_GATEWAY` (for reading from IPFS)
- Without Pinata keys, backend will use mock CIDs (for testing only)

## Vercel Deployment Settings

- **Root Directory**: `private-ledger-flow`
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Important Notes

✅ Build completed successfully - no errors!
⚠️ Large chunk warnings are normal for crypto libraries
✅ All fixes applied and tested

