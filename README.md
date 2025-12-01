# Private Expense Tracker

🔐 **Encrypted Expense Dashboard with Fully Homomorphic Encryption (FHE) and Blockchain Attestation**

A privacy-first expense tracking application that uses Zama's FHE technology to encrypt expense data, stores it on IPFS, and attests transactions on the Sepolia blockchain. Amounts remain encrypted throughout the entire process - even during computation!

## ✨ Features

- 🔒 **Fully Homomorphic Encryption** - Expenses encrypted with Zama Relayer SDK
- ⛓️ **Blockchain Attestation** - On-chain verification on Sepolia testnet
- 📦 **IPFS Storage** - Decentralized storage for encrypted data
- 🎨 **Modern UI** - Beautiful dark theme with gradient accents
- 🔐 **Wallet Integration** - Connect with MetaMask, WalletConnect, and more
- 📊 **Dashboard** - View encrypted expenses and statistics
- ✅ **Verification** - Verify attestations on-chain using IPFS CIDs
- 🌍 **Multi-language** - i18n support (English, Hindi, and more)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (for on-chain attestations)
- Alchemy/Infura RPC URL (for Sepolia)

### Installation

```bash
# Clone the repository
git clone https://github.com/anshitraj/private-ledger-flow.git
cd private-ledger-flow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the `private-ledger-flow` directory:

```env
# Smart Contract
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress

# Blockchain RPC
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Zama Relayer
VITE_RELAYER_URL=https://relayer.testnet.zama.org/

# Backend API
VITE_BACKEND_URL=http://localhost:3001

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# IPFS Gateway
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### Deploy Smart Contract

```bash
cd hardhat
npm install
npx hardhat deploy --network sepolia
```

Copy the deployed contract address to your `.env` file.

### Run Development Server

```bash
# Frontend
cd private-ledger-flow
npm run dev

# Backend (in separate terminal)
cd backend
npm install
npm run dev
```

Visit http://localhost:8080

## 🏗️ Architecture

### Frontend (`private-ledger-flow/`)
- **React + Vite** - Modern React with Vite build tool
- **Wagmi + RainbowKit** - Ethereum wallet integration
- **Zama Relayer SDK** - FHE encryption/decryption
- **shadcn/ui** - Beautiful component library
- **Framer Motion** - Smooth animations

### Backend (`backend/`)
- **Express.js** - REST API server
- **Prisma** - Database ORM (PostgreSQL/SQLite)
- **IPFS Service** - Pinata integration for IPFS uploads
- **Ethereum Listener** - Monitors blockchain events

### Smart Contract (`hardhat/`)
- **Solidity** - ConfidentialExpenses contract
- **Hardhat** - Development environment
- **Sepolia Testnet** - Deployment target

## 🔐 FHE Integration

This application uses **Zama Relayer SDK** for Fully Homomorphic Encryption:

- **Encryption**: Uses `createEncryptedInput()` to encrypt expense amounts
- **Decryption**: Uses `userDecrypt()` or `publicDecrypt()` for decryption
- **Relayer**: Official Zama testnet relayer at `https://relayer.testnet.zama.org/`

### Encryption Flow

1. User enters expense amount
2. Amount encrypted with Zama FHE SDK
3. Encrypted data uploaded to IPFS
4. IPFS CID + submission hash attested on-chain
5. Transaction hash stored for verification

### Decryption Flow

1. User clicks "Decrypt Locally"
2. Encrypted data downloaded from IPFS
3. Decrypted using Zama SDK
4. Plaintext amount displayed (only to user)

## 📦 IPFS Integration

The application uses **Pinata** for IPFS storage:

- Encrypted expense data stored on IPFS
- CID (Content Identifier) used for verification
- Public IPFS gateway for retrieval

## ⛓️ Blockchain Integration

### Smart Contract

The `ConfidentialExpenses` contract on Sepolia:

```solidity
function attestExpense(bytes32 submissionHash, string cid, bytes txMeta) external
function verifyAttestation(bytes32 submissionHash) external view returns (bool)
event ExpenseAttested(address indexed user, bytes32 indexed submissionHash, string cid, uint256 timestamp, bytes txMeta)
```

### Verification

Users can verify attestations by:
1. Entering IPFS CID in Verify page
2. System checks on-chain attestation
3. Displays verification status and transaction details

## 🚀 Deployment

### Vercel (Frontend)

1. Import repository to Vercel
2. Set root directory to `private-ledger-flow`
3. Add environment variables
4. Deploy!

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

### Backend Deployment

Deploy backend to:
- Vercel (Serverless Functions)
- Railway
- Render
- Or any Node.js hosting

Update `VITE_BACKEND_URL` in frontend after deployment.

## 📚 Documentation

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Environment Variables Quick Reference](./VERCEL_ENV_VARIABLES.md)
- [Environment Setup](./ENV_SETUP.md)

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Blockchain**: Wagmi, RainbowKit, Viem
- **FHE**: Zama Relayer SDK
- **Storage**: IPFS (Pinata)
- **Backend**: Express.js, Prisma
- **Smart Contracts**: Solidity, Hardhat
- **UI**: shadcn/ui, Framer Motion, Lucide Icons

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

Built with:
- [Zama FHE](https://zama.ai/) - Fully Homomorphic Encryption
- [RainbowKit](https://rainbowkit.com/) - Wallet connection
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [IPFS](https://ipfs.io/) - Decentralized storage

## 🔗 Links

- **GitHub**: https://github.com/anshitraj/private-ledger-flow
- **Zama Docs**: https://docs.zama.ai/
- **Zama Discord**: https://discord.com/invite/fhe-org

## 📞 Support

- Open an issue on GitHub
- Join Zama Discord for FHE questions
- Check documentation in `/docs` folder

---

**Built with ❤️ using Zama FHE technology**

