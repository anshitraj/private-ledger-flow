# Database Migration Fix - Missing Tables in Production

## Problem

Your Supabase database has **no tables**! This is why transactions aren't showing up. The Prisma migrations haven't been run on your production database.

## Solution: Run Database Migrations

You have **3 options** to create the tables:

---

## Option 1: Run Migration via API Endpoint (Easiest) ⭐

After deploying the updated backend code, call the migration endpoint:

```bash
curl -X POST https://your-backend.vercel.app/api/migrate
```

Or in your browser console:
```javascript
fetch('https://your-backend.vercel.app/api/migrate', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

**What this does:**
- Runs `prisma migrate deploy` which creates all tables
- Applies the migration from `backend/prisma/migrations/20251030171627_init/`

**Check status:**
```bash
curl https://your-backend.vercel.app/api/migrate/status
```

---

## Option 2: Run SQL Directly in Supabase (Fastest)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar (icon looks like `</>`)
3. Click **New Query**

### Step 2: Paste This SQL

Copy and paste this SQL (from your migration file):

```sql
-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "userAddress" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "submissionHash" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expenses_cid_key" ON "expenses"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_submissionHash_key" ON "expenses"("submissionHash");

-- CreateIndex
CREATE INDEX "expenses_userAddress_idx" ON "expenses"("userAddress");

-- CreateIndex
CREATE INDEX "expenses_timestamp_idx" ON "expenses"("timestamp");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");
```

### Step 3: Run It

1. Click **Run** button (or press `Ctrl+Enter`)
2. You should see "Success. No rows returned"
3. Go back to **Table Editor** - you should now see the `expenses` table!

---

## Option 3: Run Migration Locally (If you have DATABASE_URL)

If you have the production `DATABASE_URL` set locally:

```bash
cd backend

# Set your production DATABASE_URL
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Run migration
npx prisma migrate deploy
```

**⚠️ Be careful:** This uses your production database, so make sure you're using the correct `DATABASE_URL`!

---

## Verify Tables Were Created

After running any of the above options:

1. Go to Supabase Dashboard → **Table Editor**
2. You should see the `expenses` table
3. The table should have these columns:
   - `id` (integer, primary key)
   - `userAddress` (text)
   - `cid` (text, unique)
   - `submissionHash` (text, unique)
   - `txHash` (text)
   - `blockNumber` (text, nullable)
   - `timestamp` (timestamp)
   - `category` (text, nullable)
   - `note` (text, nullable)
   - `status` (text, default: 'pending')
   - `createdAt` (timestamp)
   - `updatedAt` (timestamp)

---

## After Creating Tables

Once tables are created:

1. **Sync blockchain events** to populate the database:
   ```bash
   curl -X POST https://your-backend.vercel.app/api/records/sync
   ```

2. **Refresh your frontend** - transactions should now appear!

---

## Why This Happened

Prisma migrations are **not automatically run** in serverless environments like Vercel. You need to either:
- Run them manually (Option 1 or 2 above)
- Add a migration step to your build process (see below)

---

## Optional: Auto-Run Migrations on Deploy

To automatically run migrations on every deploy, update `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.ts"
    }
  ],
  "build": {
    "env": {
      "PRISMA_GENERATE_DATAPROXY": "false"
    }
  }
}
```

And update `backend/package.json` build script:

```json
{
  "scripts": {
    "vercel-build": "npm run build && npx prisma migrate deploy"
  }
}
```

**Note:** This runs migrations on every deploy, which is safe for `migrate deploy` but be cautious in production.

---

## Quick Fix Checklist

- [ ] Run migration (choose one option above)
- [ ] Verify `expenses` table exists in Supabase
- [ ] Sync blockchain events: `POST /api/records/sync`
- [ ] Check frontend - transactions should appear!

---

**The fastest way: Use Option 2 (SQL directly in Supabase) - takes 30 seconds!** 🚀

