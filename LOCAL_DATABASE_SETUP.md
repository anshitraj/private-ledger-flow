# Local Database Setup - Connected to Supabase

## ✅ Completed Steps

1. **Updated `DATABASE_URL`** in `backend/.env` to point to Supabase
2. **Generated Prisma Client**: `npx prisma generate` ✅
3. **Synced Database Schema**: `npx prisma db push` ✅

## Current Status

- ✅ **Database Connected**: PostgreSQL at Supabase
- ✅ **Schema Synced**: Tables already exist and are in sync
- ✅ **Prisma Client Generated**: Ready to use

## Your Database URL

```
postgresql://postgres:Bleedingedge20030@db.sayehwuafplvozjqxhgb.supabase.co:5432/postgres
```

## Available Commands

### Generate Prisma Client (after schema changes)
```bash
cd backend
npx prisma generate
```

### Push Schema Changes to Database
```bash
cd backend
npx prisma db push
```

### View Database in Browser
```bash
cd backend
npx prisma studio
```
This opens http://localhost:5555 where you can view/edit your database

### Run Migrations (Production-ready)
```bash
cd backend
npx prisma migrate deploy
```

### Check Migration Status
```bash
cd backend
npx prisma migrate status
```

## Next Steps

1. **Start your backend locally**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test creating an expense**:
   - Frontend will save to backend after blockchain confirmation
   - Check Supabase dashboard or Prisma Studio to see the record

3. **Verify connection**:
   - Backend should connect to Supabase database
   - Expenses saved locally will appear in Supabase

## Important Notes

- **Local and Production share the same database** now
- Changes made locally will be visible in production and vice versa
- This is fine for development, but consider separate databases for production later

## Troubleshooting

### If tables don't exist:
```bash
npx prisma db push --force-reset  # ⚠️ WARNING: Deletes all data!
```

### If you see connection errors:
- Verify `DATABASE_URL` in `backend/.env` is correct
- Check Supabase dashboard → Settings → Database → Connection string
- Ensure your IP is allowed (Supabase allows all by default on free tier)

### If Prisma client is outdated:
```bash
npx prisma generate
```

---

**Your local backend is now connected to Supabase!** 🚀

