# Vercel Deployment Guide

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### Frontend (private-ledger-flow) Environment Variables

```env
# Smart Contract
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere

# Blockchain RPC
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# OR
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Zama Relayer
VITE_RELAYER_URL=https://relayer.testnet.zama.org/

# Backend API URL (for production, use your backend deployment URL)
VITE_BACKEND_URL=https://your-backend.vercel.app
# OR if backend is on a different service:
VITE_BACKEND_URL=https://your-backend.railway.app

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# IPFS Gateway (optional, defaults to Pinata)
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### Backend Environment Variables (if deploying backend separately)

```env
# Server Port
BACKEND_PORT=3001

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Blockchain RPC
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0xYourContractAddressHere

# IPFS (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs

# Coprocessor (optional)
COPROCESSOR_URL=https://your-coprocessor-url
COPROC_HMAC_KEY=your_hmac_secret
```

## Deployment Steps

### 1. Frontend Deployment (Vercel)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**
   - **Root Directory**: `private-ledger-flow`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables listed above (with `VITE_` prefix)
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### 2. Backend Deployment (Optional - if using Vercel Serverless)

If deploying backend to Vercel as serverless functions:

1. **Configure Backend**
   - Root Directory: `backend`
   - Framework Preset: Other
   - Build Command: `npm run build` (if you have one)
   - Output Directory: `dist` (if applicable)

2. **Add Environment Variables**
   - Add all backend environment variables
   - Make sure `VITE_BACKEND_URL` in frontend points to your backend URL

### 3. Update Frontend Backend URL

After backend is deployed, update the frontend environment variable:
```env
VITE_BACKEND_URL=https://your-backend.vercel.app
```

## Important Notes

1. **CORS Configuration**: Make sure your backend CORS allows your Vercel frontend domain
   - Update `backend/src/app.ts` to include your Vercel domain in CORS origins

2. **Database**: If using a database, make sure it's accessible from Vercel
   - Consider using Vercel Postgres or external services like Supabase/Railway

3. **IPFS**: Pinata requires API keys for uploads
   - Get keys from [Pinata](https://pinata.cloud)

4. **RPC URLs**: Use reliable RPC providers
   - Infura, Alchemy, or QuickNode
   - Free tiers may have rate limits

5. **WalletConnect**: Get project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)

## Build Warnings

The build may show warnings about:
- Large chunk sizes (>500KB) - This is normal for crypto libraries
- Comment annotations - These are harmless

These warnings don't affect functionality.

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify RPC URL is valid
- Check contract address is correct

### CORS Errors
- Update backend CORS to include Vercel domain
- Check `VITE_BACKEND_URL` is correct

### Wallet Connection Issues
- Verify `VITE_WALLETCONNECT_PROJECT_ID` is set
- Check network configuration matches Sepolia

### IPFS Upload Fails
- Verify Pinata API keys are correct
- Check IPFS gateway URL is accessible

