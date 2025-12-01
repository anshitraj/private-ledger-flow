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

