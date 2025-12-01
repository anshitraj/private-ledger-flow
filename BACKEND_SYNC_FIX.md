# Backend Sync Fix - Missing Transactions in Production

## Problem

After deploying to production (Vercel), all transactions disappear from the frontend even though the backend is working. This happens because:

1. **Ethereum Listener Doesn't Run in Serverless**: The persistent Ethereum event listener is disabled in serverless environments (like Vercel) because serverless functions can't run persistent processes.

2. **Database Never Gets Synced**: Without the listener running, blockchain events are never synced to the production database.

3. **Frontend Shows Empty Data**: The frontend queries `/api/records` which returns data from the database, but since events were never synced, the database is empty.

## Solution

A **manual sync endpoint** has been added that can sync all historical blockchain events to the database.

### New Endpoint: `POST /api/records/sync`

This endpoint manually syncs blockchain events to the database. It:
- Processes events in chunks (1000 blocks at a time) to avoid RPC rate limits
- Extracts transaction hash and block number from events
- Upserts records (avoids duplicates)
- Can sync from a specific block range or auto-detect from deployment block

## How to Use

### Option 1: Call the Sync Endpoint Directly

After deploying the backend, call the sync endpoint:

```bash
# Sync all events (auto-detects from last 10,000 blocks or CONTRACT_DEPLOYMENT_BLOCK env var)
curl -X POST https://your-backend.vercel.app/api/records/sync

# Sync from a specific block range
curl -X POST "https://your-backend.vercel.app/api/records/sync?fromBlock=5000000&toBlock=6000000"
```

### Option 2: Set Environment Variable for Deployment Block

To sync from the exact contract deployment block, set the `CONTRACT_DEPLOYMENT_BLOCK` environment variable in Vercel:

1. Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables
2. Add:
   - **Name**: `CONTRACT_DEPLOYMENT_BLOCK`
   - **Value**: `[block number where contract was deployed]` (e.g., `5000000`)
   - **Environments**: Production, Preview, Development

3. Redeploy the backend

4. Call the sync endpoint (it will now sync from the deployment block)

### Option 3: Use Browser or Frontend

You can also trigger the sync from your browser's console or add a sync button to your frontend:

```javascript
// In browser console on your production site
fetch('https://your-backend.vercel.app/api/records/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log);
```

## Response Format

```json
{
  "success": true,
  "message": "Sync completed: 15 events synced, 0 errors",
  "synced": 15,
  "errors": 0
}
```

## Finding Your Contract Deployment Block

If you don't know the deployment block:

1. **Via Etherscan**:
   - Go to https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
   - Look at the "Contract Creation" transaction
   - Note the block number

2. **Via Hardhat Deployment**:
   - Check `hardhat/deployments/address.json` for deployment timestamp
   - Use Sepolia block explorer to find blocks around that time

3. **Via RPC**:
   ```bash
   # Get contract creation block (advanced)
   # You'll need the deployment transaction hash
   ```

## Automatic Sync Options

### Option A: Vercel Cron Job (Recommended)

Create a `vercel.json` cron job to sync periodically:

```json
{
  "crons": [{
    "path": "/api/records/sync",
    "schedule": "0 */6 * * *"
  }]
}
```

This syncs every 6 hours automatically.

### Option B: External Cron Service

Use a service like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions

To call `POST /api/records/sync` on a schedule.

## After Syncing

Once you've synced the events:

1. **Check the sync response** - Verify events were synced successfully
2. **Refresh your frontend** - Transactions should now appear
3. **Set up automatic sync** - Use one of the cron options above to keep it in sync

## Troubleshooting

### No events synced

- **Check contract address**: Verify `CONTRACT_ADDRESS` env var is correct
- **Check RPC URL**: Verify `SEPOLIA_RPC_URL` is working (test with `curl`)
- **Check block range**: If specifying blocks, ensure they're correct
- **Check logs**: Look at Vercel function logs for errors

### Rate limiting errors

- The sync processes in chunks to avoid rate limits
- If you still get errors, try syncing smaller ranges
- Consider upgrading your RPC provider plan

### Database connection errors

- Verify `DATABASE_URL` is set correctly in Vercel
- Check that migrations have been run
- Ensure database is accessible from Vercel

## Next Steps

After fixing this, consider:

1. **Setting up automatic sync** via cron job
2. **Monitoring sync status** in your admin panel
3. **Alerting** when sync fails
4. **Manual sync button** in admin UI for on-demand syncs

---

**All fixes have been implemented. Deploy the updated backend and call the sync endpoint to restore your transactions!** 🚀

