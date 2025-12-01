# Frontend Deployment Guide - Complete

## 🚀 Quick Deploy Checklist

### ✅ Vercel Project Settings

- **Project Name**: `private-expense-tracker` ✅
- **Framework Preset**: `Vite` ✅
- **Root Directory**: `private-ledger-flow` ✅
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

---

## 📋 Frontend Environment Variables

### Copy these EXACTLY into Vercel:

```env
VITE_BACKEND_URL=https://private-ledger-flow-backend.vercel.app
VITE_CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ
VITE_RELAYER_URL=https://relayer.testnet.zama.org/
VITE_WALLETCONNECT_PROJECT_ID=53cdde5cc0f1e05662956d670abc5a8c
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

---

## 📝 Step-by-Step: Add Environment Variables

### In Vercel Dashboard:

1. **Before clicking "Deploy"**, click **"Environment Variables"** to expand it
2. **Click "Add"** for each variable below
3. **Add all 6 variables** (select "All Environments" for each)
4. **Then click "Deploy"**

### Variable 1:
- **Name**: `VITE_BACKEND_URL`
- **Value**: `https://private-ledger-flow-backend.vercel.app`
- **Environments**: All Environments

### Variable 2:
- **Name**: `VITE_CONTRACT_ADDRESS`
- **Value**: `0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E`
- **Environments**: All Environments

### Variable 3:
- **Name**: `VITE_SEPOLIA_RPC_URL`
- **Value**: `https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ`
- **Environments**: All Environments

### Variable 4:
- **Name**: `VITE_RELAYER_URL`
- **Value**: `https://relayer.testnet.zama.org/`
- **Environments**: All Environments

### Variable 5:
- **Name**: `VITE_WALLETCONNECT_PROJECT_ID`
- **Value**: `53cdde5cc0f1e05662956d670abc5a8c`
- **Environments**: All Environments

### Variable 6:
- **Name**: `VITE_IPFS_GATEWAY`
- **Value**: `https://gateway.pinata.cloud/ipfs/`
- **Environments**: All Environments

---

## ✅ After Deployment

1. **Wait for build to complete** (usually 1-2 minutes)
2. **Visit your frontend URL**: `https://private-expense-tracker.vercel.app`
3. **Test the app**:
   - Connect wallet
   - Add an expense
   - View records
   - Decrypt expenses

---

## 🔍 Troubleshooting

### If build fails:
- Check all environment variables are added
- Verify no typos in variable names
- Ensure all start with `VITE_`

### If app doesn't connect to backend:
- Verify `VITE_BACKEND_URL` is correct
- Check backend is accessible: `https://private-ledger-flow-backend.vercel.app/api/health`

### If wallet doesn't connect:
- Verify `VITE_WALLETCONNECT_PROJECT_ID` is set
- Check you're on Sepolia testnet

---

## 🎉 You're Ready!

Click **"Deploy"** after adding all environment variables!

