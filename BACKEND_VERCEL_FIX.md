# Backend Vercel Configuration - Issues & Fixes

## ⚠️ Issues Found in Your Configuration

### 1. DATABASE_URL is Incomplete ❌
**Current:** `ast-2.pooler.supabase.com:6543/postgres`  
**Problem:** Missing protocol and credentials  
**Should be:** `postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres`

### 2. Wrong Variable Names for Backend ❌
**Current:** Using `VITE_` prefix (these are for frontend!)  
**Backend needs:** Variables WITHOUT `VITE_` prefix

### 3. Missing Required Variables ❌
- `SEPOLIA_RPC_URL` (you have `VITE_SEPOLIA_RPC_URL`)
- `CONTRACT_ADDRESS` (you have `VITE_CONTRACT_ADDRESS`)

---

## ✅ Correct Backend Environment Variables

### Remove These (Frontend Variables):
```
❌ VITE_CONTRACT_ADDRESS
❌ VITE_RELAYER_URL
❌ VITE_SEPOLIA_RPC_URL
```

### Add/Keep These (Backend Variables):

```env
# Database (PostgreSQL) - FIX THIS!
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# Blockchain - REQUIRED
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ
CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E

# IPFS (Pinata) - REQUIRED
PINATA_API_KEY=c10b098e84031770f38b
PINATA_SECRET_API_KEY=50766f1b634a2054c7c7adb589b47738
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs

# Server (Optional)
BACKEND_PORT=3001
```

---

## 🔧 How to Fix DATABASE_URL

### Step 1: Get Complete Supabase URL

1. Go to your Supabase project dashboard
2. Settings → Database
3. Scroll to "Connection string"
4. Select "URI" tab
5. Copy the FULL connection string

It should look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Step 2: Replace [YOUR-PASSWORD]

Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

### Step 3: Use in Vercel

Paste the complete URL (with password) into Vercel's `DATABASE_URL` field.

---

## 📋 Complete Checklist

### ✅ Remove from Vercel:
- [ ] `VITE_CONTRACT_ADDRESS`
- [ ] `VITE_RELAYER_URL`  
- [ ] `VITE_SEPOLIA_RPC_URL`

### ✅ Add to Vercel:
- [ ] `DATABASE_URL` (complete PostgreSQL URL from Supabase)
- [ ] `SEPOLIA_RPC_URL` (same value as VITE_SEPOLIA_RPC_URL, but without VITE_)
- [ ] `CONTRACT_ADDRESS` (same value as VITE_CONTRACT_ADDRESS, but without VITE_)
- [ ] `BACKEND_PORT=3001` (optional)

### ✅ Keep in Vercel:
- [x] `PINATA_API_KEY`
- [x] `PINATA_SECRET_API_KEY`
- [x] `IPFS_GATEWAY_URL`

---

## 🎯 Quick Fix Steps

1. **Fix DATABASE_URL:**
   - Get complete URL from Supabase
   - Replace in Vercel

2. **Remove VITE_ variables:**
   - Delete `VITE_CONTRACT_ADDRESS`
   - Delete `VITE_RELAYER_URL`
   - Delete `VITE_SEPOLIA_RPC_URL`

3. **Add backend variables:**
   - Add `SEPOLIA_RPC_URL` = value from `VITE_SEPOLIA_RPC_URL`
   - Add `CONTRACT_ADDRESS` = value from `VITE_CONTRACT_ADDRESS`

4. **Verify Install Command:**
   - Should be: `npm install` (not `npm install --prefix=..`)

5. **Deploy!**

---

## 📝 Final Backend Environment Variables

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ
CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E
PINATA_API_KEY=c10b098e84031770f38b
PINATA_SECRET_API_KEY=50766f1b634a2054c7c7adb589b47738
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
BACKEND_PORT=3001
```

---

**After fixing, click "Deploy" and your backend should work!** 🚀

