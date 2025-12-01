# Fix Database Connection Errors

## 🚨 Problem

Your backend shows:
```
Can't reach database server at `db.sayehwuafplvozjqxhgb.supabase.co:5432`
```

**This causes:**
- Transactions to disappear (save fails initially)
- Slow response times (Prisma retries)
- Intermittent failures

## ✅ Solution: Use Connection Pooler

The direct connection (5432) is unreliable. Switch to pooler (6543).

### Step 1: Get Pooler Connection String

1. Go to **Supabase Dashboard** → Your Project
2. **Settings** → **Database**
3. Scroll to **Connection string**
4. Click **Connection Pooling** tab (NOT URI tab)
5. Copy the connection string
6. It should look like:
   ```
   postgresql://postgres.sayehwuafplvozjqxhgb:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
   ```

### Step 2: Update backend/.env

**Change from:**
```env
DATABASE_URL=postgresql://postgres:Bleedingedge20030@db.sayehwuafplvozjqxhgb.supabase.co:5432/postgres
```

**Change to:**
```env
DATABASE_URL=postgresql://postgres.sayehwuafplvozjqxhgb:Bleedingedge20030@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
```

**Key differences:**
- Port: `6543` (pooler) instead of `5432` (direct)
- Host: `pooler.supabase.com` instead of `db.xxxxx.supabase.co`
- Username: `postgres.xxxxx` (with project ID) instead of `postgres`

### Step 3: Restart Backend

```bash
# Stop backend (Ctrl+C)
cd backend
npm run dev
```

### Step 4: Test Connection

```bash
cd backend
npx prisma db pull
```

Should work without connection errors.

---

## ✅ Benefits

- ✅ **No more connection errors** - Pooler is more reliable
- ✅ **Faster connections** - Connection pooling reuses connections
- ✅ **Better for localhost** - Works great for development
- ✅ **Same database** - Connects to same Supabase database

---

## 🎯 Why This Happens

**Direct Connection (5432):**
- Creates new connection for each request
- Can timeout or fail
- Limited concurrent connections
- No connection reuse

**Pooler Connection (6543):**
- Maintains connection pool
- Reuses existing connections
- Better reliability
- Handles load better

---

**After this change, database connection errors should stop and transactions will save reliably!** 🚀

