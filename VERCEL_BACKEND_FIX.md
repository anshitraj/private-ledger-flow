# Vercel Backend Deployment - Final Fixes

## ✅ DATABASE_URL is Correct!

Your DATABASE_URL looks good:
```
postgresql://postgres.sayehwuafplvozjqxhgb:Bleedingedge20030@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
```

## 🔧 What Was Fixed

### 1. Created Serverless Entry Point
- Created `backend/api/index.ts` - Vercel serverless function handler
- Exports Express app directly (no server startup)

### 2. Updated vercel.json
- Changed to use `rewrites` instead of `builds`
- Proper routing for serverless functions

### 3. Made Ethereum Listener Optional
- Serverless functions can't run persistent listeners
- Listener now only starts in non-serverless environments

### 4. Added Prisma Generate to Build
- Ensures Prisma client is generated before deployment

### 5. Updated CORS
- Added Vercel, Railway, Render domains to allowed origins

---

## 📋 Vercel Configuration Checklist

### In Vercel Dashboard:

1. **Root Directory**: `backend`
2. **Framework**: Other
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Environment Variables (Verify These):

```env
DATABASE_URL=postgresql://postgres.sayehwuafplvozjqxhgb:Bleedingedge20030@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ
CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E
PINATA_API_KEY=c10b098e84031770f38b
PINATA_SECRET_API_KEY=50766f1b634a2054c7c7adb589b47738
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

---

## 🚀 Redeploy Steps

1. **Pull latest changes** (if deploying from Git):
   - Vercel should auto-deploy on push

2. **Or manually redeploy**:
   - Go to Vercel Dashboard → Your Project
   - Click "Redeploy" → "Redeploy"

3. **Check deployment logs**:
   - Look for any build errors
   - Verify Prisma client generation succeeds

4. **Test the endpoint**:
   - `https://your-backend.vercel.app/api/health`
   - Should return: `{"status":"ok","timestamp":"...","version":"1.0.0"}`

---

## ⚠️ Important Notes

1. **Ethereum Listener**: Won't run in serverless (by design)
   - Events are still processed when API endpoints are called
   - For persistent listening, consider a separate service

2. **Prisma Client**: Must be generated during build
   - Build command includes `npx prisma generate`
   - If build fails, check Prisma generation logs

3. **Database Migrations**: Run automatically on first request
   - Or manually: `npx prisma migrate deploy` in Vercel CLI

---

## 🔍 Troubleshooting

### If still getting 500 error:

1. **Check Vercel Function Logs**:
   - Vercel Dashboard → Your Project → Functions → View Logs
   - Look for specific error messages

2. **Verify Environment Variables**:
   - All variables are set correctly
   - No typos in variable names
   - DATABASE_URL is complete (with password)

3. **Check Build Logs**:
   - Verify TypeScript compilation succeeds
   - Verify Prisma client generation succeeds

4. **Test Locally First**:
   ```bash
   cd backend
   npm run build
   npm start
   ```

---

## ✅ After Successful Deployment

1. Copy your backend URL: `https://your-backend.vercel.app`
2. Update frontend `VITE_BACKEND_URL` with this URL
3. Deploy frontend
4. Test the full application!

---

**All fixes have been pushed to GitHub. Redeploy in Vercel and it should work!** 🚀

