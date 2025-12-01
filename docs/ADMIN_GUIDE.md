# Private Expense Tracker - Admin Guide

Complete guide for administrators and developers managing the Private Expense Tracker platform.

## Table of Contents

1. [Deployment](#deployment)
2. [Environment Configuration](#environment-configuration)
3. [Database Management](#database-management)
4. [Contract Deployment](#contract-deployment)
5. [Backend Management](#backend-management)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## Deployment

### Frontend Deployment (Vercel)

1. **Import Repository**
   ```bash
   # Connect GitHub to Vercel
   # Select repository: private-ledger-flow (or your repo name)
   # Set root directory: frontend
   ```

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - `VITE_CONTRACT_ADDRESS`: Deployed contract address
   - `VITE_SEPOLIA_RPC_URL`: Alchemy/Infura RPC URL
   - `VITE_RELAYER_URL`: Zama relayer URL
   - `VITE_BACKEND_URL`: Backend API URL
   - `VITE_WALLETCONNECT_PROJECT_ID`: WalletConnect project ID
   - `VITE_IPFS_GATEWAY`: IPFS gateway URL

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Update DNS if using custom domain

### Backend Deployment (Vercel)

1. **Import Repository**
   - Set root directory: `backend`
   - Framework Preset: Other

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - `DATABASE_URL`: PostgreSQL connection string
   - `SEPOLIA_RPC_URL`: Blockchain RPC URL
   - `CONTRACT_ADDRESS`: Smart contract address
   - `PINATA_API_KEY`: Pinata API key
   - `PINATA_SECRET_API_KEY`: Pinata secret key
   - `IPFS_GATEWAY_URL`: IPFS gateway URL

4. **Deploy**
   - Vercel automatically detects serverless functions
   - API routes available at `/api/*`

### Database Setup (Supabase/PostgreSQL)

1. **Create Database**
   ```sql
   -- Run Prisma migrations
   npx prisma migrate deploy
   ```

2. **Verify Tables**
   ```sql
   SELECT * FROM expenses;
   ```

3. **Set Connection Pooling**
   - Use Supabase connection pooler (port 6543)
   - Add `?pgbouncer=true` to connection string

## Environment Configuration

### Frontend Environment Variables

```env
# Smart Contract
VITE_CONTRACT_ADDRESS=0xYourContractAddress

# Blockchain
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Zama Relayer
VITE_RELAYER_URL=https://relayer.testnet.zama.org/

# Backend API
VITE_BACKEND_URL=https://your-backend.vercel.app

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# IPFS
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### Backend Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:6543/db?pgbouncer=true

# Blockchain
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0xYourContractAddress

# IPFS (Pinata)
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_API_KEY=your_pinata_secret
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs

# Server
PORT=3001
NODE_ENV=production
```

## Database Management

### Prisma Migrations

```bash
# Create new migration
cd backend
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### Database Schema

```prisma
model Expense {
  id          String   @id @default(uuid())
  userAddress String
  cid         String   @unique
  submissionHash String @unique
  txHash      String?
  blockNumber Int?
  timestamp   DateTime @default(now())
  category    String?
  note        String?
  status      String   @default("pending")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Common Queries

```sql
-- Get all expenses
SELECT * FROM expenses ORDER BY timestamp DESC;

-- Get expenses by user
SELECT * FROM expenses WHERE "userAddress" = '0x...' ORDER BY timestamp DESC;

-- Get expenses by category
SELECT * FROM expenses WHERE category = 'food' ORDER BY timestamp DESC;

-- Count expenses
SELECT COUNT(*) FROM expenses;

-- Get recent expenses
SELECT * FROM expenses ORDER BY timestamp DESC LIMIT 10;
```

## Contract Deployment

### Deploy to Sepolia

```bash
cd hardhat
npm install

# Set environment variables
export PRIVATE_KEY=your_private_key
export VITE_SEPOLIA_RPC_URL=your_rpc_url

# Deploy contract
npx hardhat run scripts/deploy.ts --network sepolia

# Verify contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Contract Addresses

- **Sepolia Testnet**: `0xYourContractAddress`
- **Local Development**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Contract Functions

**Public Functions**:
- `storeEncryptedAmount(bytes extHandle, bytes attestation)` - Store FHE encrypted amount
- `attestExpense(bytes32 submissionHash, string cid, bytes txMeta)` - Attest IPFS CID
- `sumUserBalances(address user)` - Sum encrypted balances
- `getUserEncryptedBalanceCount(address user)` - Get count of encrypted balances
- `getEncryptedBalanceHandle(address user, uint256 index)` - Get handle for decryption

**View Functions**:
- `verifyAttestation(bytes32 submissionHash)` - Check if hash is attested
- `getUserCids(address user)` - Get all CIDs for user
- `isAttested(bytes32 submissionHash)` - Check attestation status

## Backend Management

### API Endpoints

**Records**:
- `GET /api/records` - Get all expenses
- `POST /api/records` - Save expense record
- `GET /api/records/:cid` - Get expense by CID

**IPFS**:
- `POST /api/ipfs/upload` - Upload to IPFS
- `GET /api/ipfs/:cid` - Download from IPFS

**Proof**:
- `GET /api/proof/:cid` - Get attestation proof

**Migration**:
- `POST /api/migrate` - Run database migrations
- `GET /api/migrate/status` - Check migration status

### Starting Backend Locally

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3001`

### Backend Logs

```bash
# View Vercel logs
vercel logs

# View local logs
# Logs appear in console when running `npm run dev`
```

## Monitoring & Maintenance

### Health Checks

1. **Database Connection**
   ```bash
   # Test connection
   cd backend
   npx prisma db pull
   ```

2. **Contract Status**
   - Check contract on Etherscan
   - Verify events are being emitted
   - Check transaction success rate

3. **IPFS Status**
   - Test upload/download
   - Verify Pinata API keys
   - Check gateway accessibility

### Monitoring Metrics

- **Transaction Success Rate**: % of successful on-chain transactions
- **IPFS Upload Success**: % of successful IPFS uploads
- **API Response Time**: Average response time for API calls
- **Database Query Time**: Performance of database queries

### Backup Procedures

1. **Database Backup**
   ```bash
   # Export database
   pg_dump DATABASE_URL > backup.sql
   ```

2. **IPFS Backup**
   - Pinata automatically pins data
   - Keep backup of important CIDs
   - Export CID list regularly

3. **Contract Backup**
   - Save contract ABI
   - Document contract address
   - Keep deployment transaction hash

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Check `DATABASE_URL` format
- Verify connection pooler settings
- Test connection with `prisma db pull`

**Contract Interaction Failures**
- Verify contract address is correct
- Check RPC URL is valid
- Ensure contract is deployed on correct network

**IPFS Upload Failures**
- Verify Pinata API keys
- Check API rate limits
- Test gateway connectivity

**Relayer Rejection**
- Contract may need whitelisting with Zama
- App automatically falls back to mock encryption
- Contact Zama support for whitelisting

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=true
```

### Support Resources

- **GitHub Issues**: Report bugs
- **Zama Discord**: FHE-related questions
- **Documentation**: Check `/docs` folder
- **Contract Source**: `hardhat/contracts/ConfidentialExpenses.sol`

---

**For technical support, contact the development team or open an issue on GitHub.**

