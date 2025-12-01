# Pinata IPFS Setup Guide

## What is Pinata?

Pinata is an IPFS pinning service that ensures your encrypted expense data stays accessible on the IPFS network. The backend uses Pinata to upload encrypted expense data.

## Do I Need Pinata?

- ✅ **Backend**: YES - Required for uploading encrypted data to IPFS
- ❌ **Frontend**: NO - Only needs gateway URL for reading (no API keys)

## Setup Steps

### 1. Create Pinata Account

1. Go to [https://pinata.cloud/](https://pinata.cloud/)
2. Click "Sign Up" (free account available)
3. Verify your email

### 2. Get API Keys

1. Log in to Pinata
2. Go to **Account Settings** → **API Keys**
3. Click **"New Key"**
4. Configure:
   - **Key Name**: `private-expense-tracker`
   - **Admin**: ✅ Enable (for full access)
   - **Pinning**: ✅ Enable
5. Click **"Create Key"**
6. **IMPORTANT**: Copy both keys immediately (you won't see them again!)
   - **API Key** (starts with something like `a1b2c3d4...`)
   - **Secret API Key** (starts with something like `e5f6g7h8...`)

### 3. Add to Environment Variables

#### For Backend Deployment (Vercel/Railway/Render)

Add these environment variables:

```env
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_API_KEY=your_secret_key_here
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

#### For Local Development

Add to `backend/.env`:

```env
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_API_KEY=your_secret_key_here
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

### 4. Frontend Configuration

The frontend **does NOT need** Pinata API keys. It only needs the gateway URL for reading:

```env
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

This is already set as the default, so you can skip this if using Pinata.

## How It Works

1. **User submits expense** → Frontend encrypts with Zama FHE
2. **Frontend sends to backend** → Encrypted data + metadata
3. **Backend uploads to Pinata** → Uses API keys to pin to IPFS
4. **Pinata returns CID** → Content Identifier (like `QmXJG5aLWwwyaQc1Mkto...`)
5. **Backend stores CID** → Saves to database and attests on-chain
6. **Frontend reads from IPFS** → Uses gateway URL (no keys needed)

## Free Tier Limits

Pinata free tier includes:
- ✅ Unlimited uploads
- ✅ 1 GB storage
- ✅ Public gateway access
- ✅ API access

This is sufficient for development and small-scale production.

## Troubleshooting

### "Pinata API keys not configured"

- **Symptom**: Backend logs show "⚠️ Pinata API keys not configured, using mock CID"
- **Solution**: Add `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` to backend environment
- **Note**: App will work with mock CIDs for testing, but real IPFS uploads won't work

### "Pinata upload failed"

- Check API keys are correct
- Verify keys have "Pinning" permission enabled
- Check Pinata dashboard for rate limits or errors
- Ensure keys are added to **backend** environment, not frontend

### "IPFS retrieval failed"

- This is usually a frontend issue
- Check `VITE_IPFS_GATEWAY` is set correctly
- Try using a different gateway: `https://ipfs.io/ipfs/` or `https://cloudflare-ipfs.com/ipfs/`

## Alternative IPFS Providers

If you don't want to use Pinata, you can use:

- **nft.storage** - Free, by Protocol Labs
- **Web3.Storage** - Free, by Protocol Labs  
- **Infura IPFS** - Free tier available
- **Self-hosted IPFS node** - Advanced setup

Update `backend/src/services/ipfsService.ts` to use your preferred provider.

## Security Notes

- ⚠️ **Never commit API keys to Git**
- ✅ Use environment variables only
- ✅ Rotate keys if exposed
- ✅ Use different keys for production vs development
- ✅ Pinata keys are backend-only (frontend doesn't need them)

## Next Steps

After setting up Pinata:

1. ✅ Add keys to backend environment
2. ✅ Test upload by adding an expense
3. ✅ Check Pinata dashboard to see pinned files
4. ✅ Verify CID is stored in database
5. ✅ Test retrieval by decrypting an expense

---

**Need Help?** 
- Pinata Docs: https://docs.pinata.cloud/
- Pinata Support: support@pinata.cloud

