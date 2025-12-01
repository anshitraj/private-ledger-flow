# Complete Fix Checklist - Transactions Missing After Production

## Current Status ✅

1. ✅ **Database table created** - `expenses` table exists in Supabase
2. ⚠️ **Table is empty** - Needs blockchain event sync
3. ⚠️ **RPC URL has placeholder** - Needs real Alchemy key

---

## Step 1: Fix RPC URL (CRITICAL) 🔧

### Local Backend `.env`:
```env
# Change this:
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# To this:
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ
```

### Vercel Backend Environment Variables:
1. Go to Vercel → Your Backend Project → Settings → Environment Variables
2. Update `SEPOLIA_RPC_URL` to: `https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ`
3. Select **All Environments**
4. Click **Save**
5. **Redeploy** backend

---

## Step 2: Sync Blockchain Events to Database 📊

After fixing the RPC URL, sync events:

### Option A: Via API Endpoint (Recommended)
```bash
curl -X POST https://your-backend.vercel.app/api/records/sync
```

### Option B: Via Browser Console
```javascript
fetch('https://your-backend.vercel.app/api/records/sync', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### Option C: Via Supabase SQL (If API doesn't work)
Run this in Supabase SQL Editor to check if events exist:
```sql
-- This won't sync, but will show if any events are in database
SELECT COUNT(*) FROM expenses;
```

---

## Step 3: Verify Everything Works ✅

### Check Database:
1. Go to Supabase → Table Editor
2. Click `expenses` table
3. You should see transaction records

### Check Backend:
```bash
# Test health endpoint
curl https://your-backend.vercel.app/api/health

# Test records endpoint
curl https://your-backend.vercel.app/api/records
```

### Check Frontend:
1. Open your production frontend
2. Go to Dashboard or Records page
3. Transactions should appear!

---

## Complete Backend Environment Variables (Verify in Vercel)

```env
# Database (PostgreSQL) - ✅ Set
DATABASE_URL=postgresql://postgres.sayehwuafplvozjqxhgb:Bleedingedge20030@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres

# Blockchain RPC - ⚠️ FIX THIS!
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ

# Contract - ✅ Set
CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E

# IPFS - ✅ Set
PINATA_API_KEY=c10b098e84031770f38b
PINATA_SECRET_API_KEY=50766f1b634a2054c7c7adb589b47738
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

---

## Troubleshooting

### "JsonRpcProvider failed to detect network"
- ✅ **Fixed by**: Updating `SEPOLIA_RPC_URL` with real Alchemy key
- Verify: Restart backend, error should disappear

### "Table exists but empty"
- ✅ **Fixed by**: Running `POST /api/records/sync` endpoint
- Verify: Check Supabase table editor after sync

### "No transactions in frontend"
- Check: Database has records (Supabase table editor)
- Check: Backend `/api/records` returns data
- Check: Frontend `VITE_BACKEND_URL` is correct

---

## Quick Test Commands

```bash
# 1. Test backend health
curl https://your-backend.vercel.app/api/health

# 2. Test records (should return data after sync)
curl https://your-backend.vercel.app/api/records

# 3. Sync blockchain events
curl -X POST https://your-backend.vercel.app/api/records/sync

# 4. Check migration status
curl https://your-backend.vercel.app/api/migrate/status
```

---

## Summary

1. ✅ **Database table**: Created and ready
2. 🔧 **Fix RPC URL**: Update in `.env` and Vercel
3. 📊 **Sync events**: Call `/api/records/sync` endpoint
4. ✅ **Verify**: Check database and frontend

**After these steps, your transactions will appear!** 🚀

