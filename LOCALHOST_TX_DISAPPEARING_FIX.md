# Fix: Transactions Disappearing on Localhost

## 🔍 Problem
Transactions are created and approved, but then disappear from the UI.

## ✅ What I Fixed

1. **Improved Error Logging**: Added detailed console logs to show exactly what's happening
2. **Better Error Messages**: Errors now show in toast notifications
3. **Request Logging**: Logs the full request payload and response

## 🐛 How to Debug

### Step 1: Check Browser Console

After creating an expense, open DevTools (F12) → Console tab

**You should see:**
```
✅ [CONTRACT] Transaction confirmed: 0x...
💾 [BACKEND] Saving expense to database: Qm...
💾 [BACKEND] Backend URL: http://localhost:3001
💾 [BACKEND] Request payload: {...}
💾 [BACKEND] Response status: 200
✅ [BACKEND] Expense saved to database: {...}
```

**If you see errors:**
- `Failed to fetch` → Backend not running
- `404 Not Found` → Backend route doesn't exist
- `500 Internal Server Error` → Database error (check backend terminal)
- `400 Bad Request` → Missing required fields

### Step 2: Check Backend Terminal

After creating expense, check backend terminal for:
```
💾 Saving expense record: Qm... from 0x...
✅ Expense record saved: Qm...
```

**If you see errors:**
- Database connection error → Check `DATABASE_URL` in `backend/.env`
- Table doesn't exist → Run `npx prisma db push`
- Validation error → Check request payload

### Step 3: Check Network Tab

DevTools → Network tab → Filter "records"

**Look for:**
- `POST /api/records` request
- Status code (200 = success, 4xx/5xx = error)
- Response body (should have `{"success": true}`)

---

## 🔧 Common Issues & Fixes

### Issue 1: Backend Not Running
**Symptom:** `Failed to fetch` in console

**Fix:**
```bash
cd backend
npm run dev
```
Keep terminal open!

### Issue 2: Database Table Missing
**Symptom:** `The table public.expenses does not exist`

**Fix:**
```bash
cd backend
npx prisma db push
```

### Issue 3: Database Connection Error
**Symptom:** `500 Internal Server Error` or database errors

**Fix:**
1. Check `backend/.env` has correct `DATABASE_URL`
2. Test connection:
   ```bash
   cd backend
   npx prisma db pull
   ```

### Issue 4: Missing Required Fields
**Symptom:** `400 Bad Request` with "Missing required fields"

**Check console logs** - should show the request payload. Verify:
- `userAddress` is set
- `cid` is set
- `submissionHash` is set
- `txHash` is set

---

## 📋 Complete Debug Checklist

1. ✅ **Backend Running**: `http://localhost:3001/api/health` works
2. ✅ **Frontend Running**: `http://localhost:8080` works
3. ✅ **Wallet Connected**: Address shown in header
4. ✅ **Browser Console Open**: F12 → Console tab
5. ✅ **Network Tab Open**: F12 → Network tab
6. ✅ **Backend Terminal Visible**: Can see backend logs

**Then create expense and watch:**
- Console for save logs
- Network tab for POST request
- Backend terminal for save confirmation

---

## 🎯 What to Look For

### Success Flow:
1. Transaction confirms ✅
2. Console shows: `💾 [BACKEND] Saving expense to database:`
3. Network shows: `POST /api/records` with status 200
4. Backend terminal shows: `✅ Expense record saved:`
5. Console shows: `✅ [BACKEND] Expense saved to database:`
6. Records refetch automatically
7. Expense appears in UI ✅

### Failure Flow:
1. Transaction confirms ✅
2. Console shows: `💾 [BACKEND] Saving expense to database:`
3. Console shows: `❌ [BACKEND] Failed to save expense: [error]`
4. Toast shows error message
5. Check error details in console

---

## ⚡ Quick Test

Run in browser console after creating expense:
```javascript
// Check if backend is accessible
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend:', d))
  .catch(e => console.error('❌ Backend not running:', e));

// Check current records
fetch('http://localhost:3001/api/records')
  .then(r => r.json())
  .then(d => console.log('📦 Records:', d))
  .catch(e => console.error('❌ Records error:', e));
```

---

## 🔍 Next Steps

After creating an expense:

1. **Check Console** - Look for the detailed logs I added
2. **Check Network Tab** - See the POST request and response
3. **Check Backend Terminal** - See if save succeeded
4. **Share the logs** - If still not working, share:
   - Console output (screenshot or copy)
   - Network tab screenshot
   - Backend terminal output

The improved logging will show exactly where it's failing!

---

**The backend is running (port 3001 is open), so the issue is likely in the save process. The new logs will show exactly what's happening!** 🔍

