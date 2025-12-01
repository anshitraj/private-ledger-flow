# Backend Database Setup Guide

## ⚠️ Important: Local vs Production

### Your Current Setup
```
DATABASE_URL=file:./dev.db
```

This is **SQLite for local development only**. It won't work in production!

### For Production Deployment
You **MUST** use **PostgreSQL** (not SQLite) for production deployments.

---

## 🎯 Quick Answer: Do You Need Supabase?

**YES, you need a PostgreSQL database for production.** Here are your options:

### Option 1: Supabase (Recommended - Free & Easy) ⭐
- ✅ Free tier: 500 MB database
- ✅ Easy setup (5 minutes)
- ✅ Works with all platforms (Vercel, Railway, Render)
- ✅ Automatic backups

### Option 2: Vercel Postgres (If using Vercel)
- ✅ Integrated with Vercel
- ✅ Easy setup
- ⚠️ Only works with Vercel

### Option 3: Railway Postgres (If using Railway)
- ✅ Automatic setup
- ✅ Free tier available
- ⚠️ Only works with Railway

### Option 4: Render Postgres
- ✅ Free tier available
- ⚠️ Only works with Render

---

## 🚀 Recommended: Supabase Setup (5 minutes)

### Step 1: Create Supabase Account

1. Go to [https://supabase.com/](https://supabase.com/)
2. Click "Start your project"
3. Sign up with GitHub (easiest)

### Step 2: Create New Project

1. Click "New Project"
2. Fill in:
   - **Name**: `private-expense-tracker`
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (sufficient for development)
3. Click "Create new project"
4. Wait 2-3 minutes for database to be created

### Step 3: Get Database URL

1. In your Supabase project dashboard
2. Go to **Settings** → **Database**
3. Scroll down to **Connection string**
4. Select **URI** tab
5. Copy the connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
6. Replace `[YOUR-PASSWORD]` with your actual password
7. This is your `DATABASE_URL` for production!

### Step 4: Use in Deployment

Add to your Vercel/Railway/Render environment variables:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

---

## 🔄 Local Development vs Production

### Local Development (Your Current Setup)
```env
# backend/.env (for local development)
DATABASE_URL=file:./dev.db
```
- ✅ Works locally
- ✅ No setup needed
- ❌ Won't work in production

### Production Deployment
```env
# Vercel/Railway/Render environment variables
DATABASE_URL=postgresql://postgres:password@host:5432/database
```
- ✅ Works in production
- ✅ Scalable
- ✅ Required for deployment

---

## 📋 Complete Backend .env for Production

```env
# Database (PostgreSQL) - REQUIRED for production
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# Blockchain
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/2_K4z_-b41_9ZyQTWeQIZ
CONTRACT_ADDRESS=0xbdfa7Da9449AA1a7a779DC1ceA671a96aAB3E57E

# IPFS (Pinata) - REQUIRED
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs

# Server
BACKEND_PORT=3001
```

---

## ✅ Summary

1. **Local Development**: Keep `file:./dev.db` (SQLite) - works fine locally
2. **Production**: Use PostgreSQL from Supabase (or Vercel/Railway Postgres)
3. **Setup Time**: 5 minutes with Supabase
4. **Cost**: Free tier is sufficient for development

**You can skip Supabase only if:**
- You're using Vercel → Use Vercel Postgres instead
- You're using Railway → Use Railway Postgres instead
- You already have a PostgreSQL database

**Otherwise, Supabase is the easiest option!**

---

## 🎯 Next Steps

1. ✅ Create Supabase account (5 min)
2. ✅ Create project and get `DATABASE_URL`
3. ✅ Add `DATABASE_URL` to Vercel/Railway environment variables
4. ✅ Deploy backend
5. ✅ Test: `https://your-backend.vercel.app/api/health`

---

**Need Help?** Supabase has great docs: https://supabase.com/docs

