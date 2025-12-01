# Quick Fix: Transactions Disappearing on Localhost

## 🚨 Immediate Checks

### 1. Is Backend Running?

**Check:**
```bash
# Open new terminal
cd backend
npm run dev
```

**You should see:**
```
🚀 Backend server running on http://localhost:3001
```

**If NOT running:** Start it and keep terminal open!

---

### 2. Test Backend Connection

Open browser and go to:
```
http://localhost:3001/api/health
```

**Should return:**
```json
{"status":"ok","timestamp":"...","version":"1.0.0"}
```

**If this fails:** Backend is not running or wrong port!

---

### 3. Check Browser Console

After creating expense, open DevTools (F12) → Console

**Look for these messages:**
- ✅ `💾 [BACKEND] Saving expense to database:` - Save attempt started
- ✅ `✅ [BACKEND] Expense saved to database:` - Save succeeded
- ❌ `❌ [BACKEND] Failed to save expense:` - Save failed (check error)

**If you see errors:**
- `Failed to fetch` → Backend not running
- `404` → Wrong backend URL
- `500` → Database error

---

### 4. Check Network Tab

DevTools → Network tab → Filter "records"

**After creating expense, look for:**
- `POST /api/records` request
- Status should be `200` (not 404, 500, etc.)
- Response should have `{"success": true, "record": {...}}`

---

### 5. Verify Database Connection

```bash
cd backend
npx prisma studio
```

Opens http://localhost:5555 - check if `expenses` table exists and has records.

---

## 🔧 Common Fixes

### Fix 1: Backend Not Running
```bash
cd backend
npm run dev
# Keep this terminal open!
```

### Fix 2: Wrong Backend URL
Check `private-ledger-flow/.env` or create it:
```env
VITE_BACKEND_URL=http://localhost:3001
```

Then restart frontend:
```bash
cd private-ledger-flow
npm run dev
```

### Fix 3: Database Table Missing
```bash
cd backend
npx prisma db push
```

### Fix 4: Database Connection Error
Check `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:Bleedingedge20030@db.sayehwuafplvozjqxhgb.supabase.co:5432/postgres
```

Test connection:
```bash
cd backend
npx prisma db pull
```

---

## 🐛 Debug Steps

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd private-ledger-flow
   npm run dev
   ```

3. **Open Browser DevTools** (F12)

4. **Create Expense:**
   - Fill form
   - Submit
   - Approve in wallet

5. **Watch Console:**
   - Should see save attempt
   - Should see success or error

6. **Check Network Tab:**
   - POST to `/api/records`
   - Check status and response

7. **Check Backend Terminal:**
   - Should see save logs
   - Check for errors

---

## 📋 Expected Console Output

**When transaction confirms, you should see:**
```
✅ [CONTRACT] Transaction confirmed: 0x...
💾 [BACKEND] Saving expense to database: Qm...
✅ [BACKEND] Expense saved to database: {success: true, record: {...}}
📡 Fetching backend records from: http://localhost:3001/api/records
📦 Backend records received: 1 records
```

**If you DON'T see these:**
- Backend not running
- Backend URL wrong
- Save failing silently

---

## ⚡ Quick Test

Run in browser console:
```javascript
// Test backend
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend:', d));

// Test records
fetch('http://localhost:3001/api/records')
  .then(r => r.json())
  .then(d => console.log('Records:', d));
```

**If first fails:** Backend not running  
**If second fails:** Database issue

---

## 🎯 Most Likely Issue

**Backend is NOT running!**

The frontend tries to save to `http://localhost:3001/api/records` but if backend isn't running, the save fails silently and the transaction disappears.

**Fix:** Start backend in a separate terminal and keep it running!

