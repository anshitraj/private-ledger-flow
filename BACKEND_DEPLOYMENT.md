# Backend Deployment Guide

## 🚀 Deploy Backend to Vercel (Serverless Functions)

### Step 1: Prepare Backend for Vercel

Vercel uses serverless functions, so we need to create API route handlers.

1. **Create `vercel.json` in backend directory:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. **Update `package.json` scripts:**

The backend already has the correct scripts. Vercel will automatically:
- Run `npm install`
- Run `npm run build` (TypeScript compilation)
- Start the server

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional, or use web dashboard):
```bash
npm install -g vercel
```

2. **Deploy from backend directory:**
```bash
cd backend
vercel
```

3. **Or use Vercel Dashboard:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
# Server Configuration
BACKEND_PORT=3001
NODE_ENV=production

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Blockchain
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E

# IPFS (Pinata) - REQUIRED for IPFS uploads
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs

# Coprocessor (Optional)
COPROCESSOR_URL=https://your-coprocessor-url
COPROC_HMAC_KEY=your_hmac_secret
```

---

## 🚂 Alternative: Deploy to Railway

Railway is easier for traditional Node.js apps with databases.

### Step 1: Create Railway Account

1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub
3. Click "New Project"

### Step 2: Deploy Backend

1. **Connect Repository:**
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set **Root Directory** to `backend`

2. **Add PostgreSQL Database:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will create a database automatically
   - Copy the `DATABASE_URL` from the database service

3. **Configure Service:**
   - **Start Command**: `npm start`
   - **Build Command**: `npm run build`

### Step 3: Add Environment Variables

In Railway Dashboard → Your Service → Variables:

```env
BACKEND_PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

---

## 🌐 Alternative: Deploy to Render

### Step 1: Create Render Account

1. Go to [Render](https://render.com/)
2. Sign up with GitHub

### Step 2: Deploy Backend

1. **New Web Service:**
   - Connect your GitHub repository
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

2. **Add PostgreSQL Database:**
   - New → PostgreSQL
   - Copy the `Internal Database URL`

### Step 3: Add Environment Variables

In Render Dashboard → Your Service → Environment:

```env
BACKEND_PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

---

## 📋 Complete Backend Environment Variables

### Required Variables

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Blockchain
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E

# IPFS (Pinata) - REQUIRED
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

### Optional Variables

```env
# Server
BACKEND_PORT=3001

# Coprocessor (for homomorphic operations)
COPROCESSOR_URL=https://your-coprocessor-url
COPROC_HMAC_KEY=your_hmac_secret
```

---

## 🔑 How to Get Each Value

### 1. DATABASE_URL (PostgreSQL)

**Option A: Vercel Postgres**
- Vercel Dashboard → Storage → Create Postgres
- Copy the connection string

**Option B: Railway**
- Railway automatically provides `${{Postgres.DATABASE_URL}}`

**Option C: Render**
- Render Dashboard → PostgreSQL → Internal Database URL

**Option D: External (Supabase, Neon, etc.)**
- Sign up at [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)
- Create database → Copy connection string
- Format: `postgresql://user:password@host:port/database`

### 2. SEPOLIA_RPC_URL

1. Go to [Alchemy](https://www.alchemy.com/)
2. Create account → Create new app
3. Select "Sepolia" network
4. Copy API Key
5. Format: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

### 3. CONTRACT_ADDRESS

- Your deployed contract address: `0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E`
- Or deploy new one: `cd hardhat && npx hardhat deploy --network sepolia`

### 4. PINATA_API_KEY & PINATA_SECRET_API_KEY

1. Go to [Pinata](https://pinata.cloud/)
2. Sign up (free account)
3. Account Settings → API Keys
4. Create new key with "Pinning" permission
5. Copy both keys immediately (you won't see them again!)

### 5. IPFS_GATEWAY_URL

- Default: `https://gateway.pinata.cloud/ipfs`
- Or use: `https://ipfs.io/ipfs/` or `https://cloudflare-ipfs.com/ipfs/`

---

## ✅ Post-Deployment Checklist

1. ✅ Backend deployed and running
2. ✅ Environment variables added
3. ✅ Database migrations run (automatic on first start)
4. ✅ Health check: `https://your-backend.vercel.app/api/health`
5. ✅ Copy backend URL for frontend `VITE_BACKEND_URL`

---

## 🔧 Troubleshooting

### Database Connection Issues

- Check `DATABASE_URL` format is correct
- Ensure database is accessible (not blocked by firewall)
- For Vercel: Use Vercel Postgres for best compatibility

### IPFS Upload Fails

- Verify Pinata API keys are correct
- Check keys have "Pinning" permission
- Test with Pinata dashboard

### Build Fails

- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

---

## 📝 Next Steps

After backend is deployed:

1. Copy your backend URL (e.g., `https://your-backend.vercel.app`)
2. Update frontend `VITE_BACKEND_URL` with this URL
3. Deploy frontend (see VERCEL_DEPLOYMENT.md)

---

**Need Help?** Check the logs in your deployment platform's dashboard for specific errors.

