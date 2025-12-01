# JSON RPC URL Fix

## Problem

The backend `.env` file has a placeholder RPC URL:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

This causes the error: `JsonRpcProvider failed to detect network`

## Solution

### Step 1: Update Backend .env File

Edit `backend/.env` and replace the placeholder with your real Alchemy API key:

**Before:**
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

**After:**
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ
```

*(Use the same key from `VITE_SEPOLIA_RPC_URL`)*

### Step 2: Update Vercel Backend Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **backend project**
3. Go to **Settings** → **Environment Variables**
4. Find `SEPOLIA_RPC_URL` (or add it if missing)
5. Set value to: `https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ`
6. Select **All Environments** (Production, Preview, Development)
7. Click **Save**
8. **Redeploy** your backend

### Step 3: Verify

After updating, the JSON RPC error should disappear. Test by:
- Starting your backend locally: `cd backend && npm run dev`
- Or checking Vercel function logs after redeploy

---

## Complete Backend Environment Variables Checklist

Make sure all these are set in Vercel backend project:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres.sayehwuafplvozjqxhgb:Bleedingedge20030@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres

# Blockchain RPC (FIX THIS!)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ

# Contract
CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E

# IPFS (Pinata)
PINATA_API_KEY=c10b098e84031770f38b
PINATA_SECRET_API_KEY=50766f1b634a2054c7c7adb589b47738
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

---

## After Fixing RPC URL

1. ✅ **Database table exists** (confirmed - `expenses` table is there)
2. ✅ **Fix RPC URL** (update `SEPOLIA_RPC_URL` as above)
3. ✅ **Sync blockchain events** to populate the table:
   ```bash
   curl -X POST https://your-backend.vercel.app/api/records/sync
   ```
4. ✅ **Refresh frontend** - transactions should appear!

---

**Once the RPC URL is fixed, the sync endpoint will work and populate your empty table!** 🚀

