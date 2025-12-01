# Environment Variables Setup

## Required .env Files (4 total)

### 1. **Root `.env`** (Optional - for root scripts)
```env
# Shared configuration (if needed for root-level scripts)
```

### 2. **`backend/.env`** (REQUIRED)
```env
# Database
DATABASE_URL=file:./prisma/dev.db

# Blockchain
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_CONTRACT_ADDRESS=0x...

# IPFS (choose one)
# Option A: Pinata
VITE_IPFS_API_KEY=your_pinata_api_key
IPFS_API_SECRET=your_pinata_secret
USE_NFT_STORAGE=false

# Option B: NFT.Storage
VITE_IPFS_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
USE_NFT_STORAGE=true

# Optional
VITE_COPROCESSOR_URL=https://relayer.testnet.zama.org/
VITE_COPROC_HMAC_KEY=demo-secret
PRIVATE_KEY=0x...  # For backend operations
```

### 3. **`hardhat/.env`** (REQUIRED for deployment)
```env
# Blockchain
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0x...  # Wallet private key for deployment
```

### 4. **`private-ledger-flow/.env`** (REQUIRED)
```env
# Blockchain
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_CONTRACT_ADDRESS=0x...

# IPFS
VITE_IPFS_API_KEY=your_ipfs_key_here

# Backend
VITE_BACKEND_URL=http://localhost:3001

# Optional: Relayer
VITE_RELAYER_URL=https://relayer.testnet.zama.org/
```

## Quick Checklist

- [x] Root `.env` - EXISTS
- [x] `backend/.env` - EXISTS (REQUIRED)
- [x] `hardhat/.env` - EXISTS (REQUIRED)
- [x] `private-ledger-flow/.env` - EXISTS (REQUIRED)

## Important Notes

1. **Backend `.env` is CRITICAL** - The backend server reads from `backend/.env` for:
   - Database connection (Prisma)
   - Ethereum RPC URL
   - Contract address
   - IPFS configuration

2. **All RPC URLs should match** - Use the same RPC URL in:
   - `backend/.env`
   - `hardhat/.env`
   - `private-ledger-flow/.env`

3. **Contract address** - After deploying, update:
   - `backend/.env` → `VITE_CONTRACT_ADDRESS`
   - `private-ledger-flow/.env` → `VITE_CONTRACT_ADDRESS`

