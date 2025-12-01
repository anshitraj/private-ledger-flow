# Localhost Transaction Disappearing - Debug Guide

## Problem
Transactions are created and approved, but then disappear from the UI.

## Quick Checks

### 1. Is Backend Running?

Open a new terminal and check:
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Backend server running on http://localhost:3001
```

**If backend is NOT running:**
- Start it: `cd backend && npm run dev`
- Keep this terminal open

### 2. Check Frontend Backend URL

Check `private-ledger-flow/.env` or `private-ledger-flow/.env.local`:
```env
VITE_BACKEND_URL=http://localhost:3001
```

**If missing or wrong:**
- Create/update the file
- Restart frontend dev server

### 3. Check Browser Console

Open browser DevTools (F12) → Console tab

**Look for:**
- `💾 [BACKEND] Saving expense to database:` - Should appear after transaction confirms
- `✅ [BACKEND] Expense saved to database:` - Should appear if save succeeds
- `❌ [BACKEND] Failed to save expense:` - Error message if save fails

**Common errors:**
- `Failed to fetch` → Backend not running or wrong URL
- `404 Not Found` → Backend route doesn't exist
- `500 Internal Server Error` → Database connection issue

### 4. Check Backend Terminal

After creating an expense, check backend terminal for:
- `💾 Saving expense record: [cid]` - Should appear
- `✅ Expense record saved: [cid]` - Should appear if successful
- Any error messages

### 5. Test Backend Directly

Open browser and go to:
```
http://localhost:3001/api/health
```

Should return:
```json
{"status":"ok","timestamp":"...","version":"1.0.0"}
```

**If this fails:**
- Backend is not running
- Wrong port
- Backend crashed

### 6. Test Records Endpoint

```
http://localhost:3001/api/records
```

Should return:
```json
{
  "success": true,
  "count": 0,
  "records": []
}
```

**If you see errors:**
- Database connection issue
- Table doesn't exist
- Check backend terminal for errors

---

## Common Issues & Fixes

### Issue 1: Backend Not Running
**Symptom:** `Failed to fetch` in console

**Fix:**
```bash
cd backend
npm run dev
```

### Issue 2: Wrong Backend URL
**Symptom:** `404 Not Found` or connection refused

**Fix:**
1. Check `private-ledger-flow/.env`:
   ```env
   VITE_BACKEND_URL=http://localhost:3001
   ```
2. Restart frontend: `npm run dev`

### Issue 3: Database Connection Error
**Symptom:** `500 Internal Server Error` or database errors in backend terminal

**Fix:**
1. Check `backend/.env` has correct `DATABASE_URL`
2. Test connection:
   ```bash
   cd backend
   npx prisma db pull
   ```
3. If fails, check Supabase connection string

### Issue 4: Table Doesn't Exist
**Symptom:** `The table public.expenses does not exist`

**Fix:**
```bash
cd backend
npx prisma db push
```

### Issue 5: Save Failing Silently
**Symptom:** Transaction confirms but doesn't save

**Check:**
1. Browser console for errors
2. Backend terminal for errors
3. Network tab in DevTools → Check POST to `/api/records`

---

## Step-by-Step Debug Process

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Keep terminal open

2. **Start Frontend:**
   ```bash
   cd private-ledger-flow
   npm run dev
   ```

3. **Open Browser DevTools:**
   - Press F12
   - Go to Console tab
   - Go to Network tab

4. **Create an Expense:**
   - Fill form and submit
   - Approve transaction in wallet
   - Watch console and network tabs

5. **Check Console:**
   - Should see: `💾 [BACKEND] Saving expense to database:`
   - Should see: `✅ [BACKEND] Expense saved to database:`
   - If errors, note them down

6. **Check Network Tab:**
   - Filter by "records"
   - Look for POST request to `/api/records`
   - Check status code (should be 200)
   - Check response (should have `success: true`)

7. **Check Backend Terminal:**
   - Should see save logs
   - Check for any errors

8. **Verify in Database:**
   ```bash
   cd backend
   npx prisma studio
   ```
   Opens http://localhost:5555 - check if record exists

---

## Quick Test Script

Run this in browser console after creating expense:

```javascript
// Test backend connection
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(console.log);

// Test records endpoint
fetch('http://localhost:3001/api/records')
  .then(r => r.json())
  .then(console.log);
```

---

## Expected Flow

1. ✅ User creates expense
2. ✅ Expense encrypted
3. ✅ Uploaded to IPFS
4. ✅ Transaction submitted to blockchain
5. ✅ Transaction hash received
6. ✅ Transaction confirmed (receipt)
7. ✅ **Frontend calls `POST /api/records`** ← Check this happens
8. ✅ **Backend saves to database** ← Check this happens
9. ✅ **Frontend invalidates cache** ← Check this happens
10. ✅ **Records refetch** ← Check this happens
11. ✅ **Expense appears in UI** ← Should work now

---

## If Still Not Working

Share:
1. Browser console errors (screenshot or copy)
2. Backend terminal output (after creating expense)
3. Network tab screenshot (POST to `/api/records`)
4. Result of test script above

This will help identify the exact issue!

