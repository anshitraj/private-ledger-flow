# How to Start Localhost Properly

## ⚠️ CRITICAL: You Need TWO Terminals Running!

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```

**You should see:**
```
🚀 Backend server running on http://localhost:3001
📊 API docs: http://localhost:3001/api/health
```

**Keep this terminal open!** The backend must be running for expenses to save.

---

### Terminal 2: Frontend Server
```bash
cd private-ledger-flow
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

---

## ✅ Verify Both Are Running

### Test Backend:
Open browser: `http://localhost:3001/api/health`

Should return:
```json
{"status":"ok","timestamp":"...","version":"1.0.0"}
```

### Test Frontend:
Open browser: `http://localhost:8080`

Should show the Private Expense Tracker app.

---

## 🐛 If Transactions Disappear

### Check 1: Is Backend Running?
- Look at Terminal 1 - is it showing the server running?
- If not, start it: `cd backend && npm run dev`

### Check 2: Browser Console
Press F12 → Console tab

**After creating expense, you should see:**
```
💾 [BACKEND] Saving expense to database: Qm...
💾 [BACKEND] Backend URL: http://localhost:3001
💾 [BACKEND] Response status: 200
✅ [BACKEND] Expense saved to database: {...}
```

**If you see errors:**
- `Failed to fetch` → Backend not running
- `404` → Backend URL wrong
- `500` → Database error

### Check 3: Network Tab
F12 → Network tab → Filter "records"

**After creating expense:**
- Should see `POST /api/records`
- Status should be `200`
- Response should have `{"success": true}`

---

## 🔧 Quick Fixes

### Backend Not Running:
```bash
cd backend
npm run dev
```

### Wrong Backend URL:
Check `private-ledger-flow/.env`:
```env
VITE_BACKEND_URL=http://localhost:3001
```

Then restart frontend.

### Database Error:
```bash
cd backend
npx prisma db push
```

---

## 📋 Complete Startup Checklist

- [ ] Terminal 1: Backend running (`npm run dev` in `backend/`)
- [ ] Terminal 2: Frontend running (`npm run dev` in `private-ledger-flow/`)
- [ ] Backend accessible: `http://localhost:3001/api/health` works
- [ ] Frontend accessible: `http://localhost:8080` works
- [ ] Wallet connected in frontend
- [ ] Browser console open (F12) to see logs

**Only then create an expense!**

---

## 🎯 Most Common Issue

**Backend is NOT running!**

The frontend creates the expense, but when it tries to save to the backend at `http://localhost:3001/api/records`, it fails because the backend isn't running. The error is caught silently, so the transaction appears to work but then disappears.

**Solution:** Always start backend first, then frontend!

