# Private Expense Tracker

Built with Zama FHEVM

This is a production-ready FHEVM implementation showcasing private expense tracking with encrypted amounts, categories, and metadata. All financial data remains encrypted throughout the entire lifecycle - from encryption to storage to on-chain attestation.

## Technology Badges

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Built with Zama FHEVM](https://img.shields.io/badge/Built%20with-Zama%20FHEVM-purple.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-orange.svg)

## Overview

Private Expense Tracker is a privacy-first financial application that leverages Zama's Fully Homomorphic Encryption (FHE) to protect user expense data. Unlike traditional expense trackers, this application ensures that:

- **Expense amounts are encrypted** using FHEVM (`euint64`) - no one can see how much you spent
- **Data is stored on IPFS** in encrypted form - decentralized and censorship-resistant
- **On-chain attestation** provides verifiable proof without revealing sensitive data
- **Homomorphic operations** allow computation on encrypted data without decryption

## Technical Deep Dive

📖 **[FHEVM_INTEGRATION.md](./docs/FHEVM_INTEGRATION.md)** - Complete guide on encryption workflows, smart contract patterns, relayer integration, and privacy architecture.

### System Overview

```mermaid
graph TB
    subgraph "User Layer"
        A[👤 User] --> B[💻 React Frontend]
    end
    
    subgraph "Encryption Layer"
        B --> C[🔐 Zama Relayer SDK]
        C --> D[📦 IPFS Storage]
    end
    
    subgraph "Blockchain Layer"
        B --> E[⚡ Smart Contract<br/>ConfidentialExpenses.sol]
        E --> F[🔗 Sepolia Network]
    end
    
    subgraph "Backend Layer"
        D --> G[🖥️ Express.js API]
        F --> G
        G --> H[🗄️ PostgreSQL Database]
    end
    
    style A fill:#f9d71c,stroke:#333,stroke-width:2px
    style C fill:#9b59b6,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#4a90e2,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#2ecc71,stroke:#333,stroke-width:2px,color:#fff
```

## Key Features

### Privacy-First Architecture

- **Encrypted Expense Amounts**: Individual amounts are encrypted using FHEVM (`euint64`) - no one can see how much you spent
- **Encrypted Metadata**: Categories and notes are encrypted and stored on IPFS
- **Encrypted User Balances**: Total platform balance encrypted using FHE homomorphic encryption
- **On-chain Verification**: Transaction hashes and IPFS CIDs provide verifiable attestations
- **User-Controlled Decryption**: Only the expense creator can decrypt their own amounts
- **Transparent Verification**: Final attestations become publicly verifiable on-chain

### Technical Features

- **Zama Relayer SDK Integration**: Real FHE encryption with automatic fallback
- **IPFS Storage**: Decentralized storage via Pinata
- **Smart Contract**: FHEVM-compatible Solidity contract on Sepolia
- **Modern Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Wallet Integration**: MetaMask, WalletConnect, and more via Wagmi/RainbowKit

## Project Structure

```
.
├── frontend/          # React frontend application
├── backend/           # Express.js backend API
├── hardhat/           # Smart contracts and deployment
├── docs/              # Documentation
│   ├── FHEVM_INTEGRATION.md
│   ├── USER_GUIDE.md
│   └── ADMIN_GUIDE.md
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH
- Alchemy/Infura RPC URL

### Installation

```bash
# Clone the repository
git clone https://github.com/anshitraj/private-ledger-flow.git
cd private-ledger-flow

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install hardhat dependencies
cd ../hardhat
npm install
```

### Environment Setup

**Frontend** (`frontend/.env`):
```env
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_RELAYER_URL=https://relayer.testnet.zama.org/
VITE_BACKEND_URL=http://localhost:3001
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:pass@host:6543/db?pgbouncer=true
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0xYourContractAddress
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_API_KEY=your_pinata_secret
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
```

### Deploy Smart Contract

```bash
cd hardhat
npx hardhat run scripts/deploy.ts --network sepolia
```

Copy the deployed contract address to your `.env` files.

### Run Development Servers

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev
```

Visit `http://localhost:8080`

## Documentation

- **[FHEVM_INTEGRATION.md](./docs/FHEVM_INTEGRATION.md)** - Complete technical documentation on FHEVM integration, encryption flows, and contract architecture
- **[USER_GUIDE.md](./docs/USER_GUIDE.md)** - End-user guide for using the application
- **[ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md)** - Deployment and administration guide

## Smart Contract

### ConfidentialExpenses.sol

The main smart contract implements:

- **FHE Storage**: `storeEncryptedAmount()` - Stores encrypted amounts as `euint64` handles
- **Attestation**: `attestExpense()` - Attests IPFS CIDs on-chain
- **Homomorphic Operations**: `sumUserBalances()` - Computes encrypted totals
- **Access Control**: `FHE.allow()` - Controls decryption permissions

See [hardhat/contracts/ConfidentialExpenses.sol](./hardhat/contracts/ConfidentialExpenses.sol) for full source code.

## FHEVM Integration

### Encryption Flow

1. User enters expense amount
2. Frontend calls `createEncryptedInput(contract, user)` via Zama Relayer SDK
3. Adds amount with `buffer.add64(BigInt(amount))`
4. Encrypts with `buffer.encrypt()` → returns `{ handles, inputProof }`
5. Calls `storeEncryptedAmount(handle, proof)` on contract
6. Contract verifies attestation and stores encrypted handle

### Decryption Flow

1. User clicks "Decrypt" on expense
2. Frontend downloads encrypted data from IPFS
3. Decrypts using Zama SDK `userDecrypt(handle)`
4. Displays plaintext amount to user

### Homomorphic Operations

The contract supports encrypted addition:
```solidity
function sumUserBalances(address user) public returns (euint64) {
    euint64 sum = FHE.asEuint64(0);
    for (uint i = 0; i < fheUserBalances[user].length; i++) {
        sum = FHE.add(sum, fheUserBalances[user][i]);
    }
    return sum;
}
```

## Deployment

### Frontend (Vercel)

1. Import repository to Vercel
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

### Backend (Vercel)

1. Set root directory to `backend`
2. Add environment variables
3. Deploy (serverless functions auto-detected)

### Database (Supabase)

1. Create PostgreSQL database
2. Run Prisma migrations: `npx prisma migrate deploy`
3. Use connection pooler (port 6543)

## Testing

```bash
# Run contract tests
cd hardhat
npm test

# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Blockchain**: Wagmi, RainbowKit, Viem, Ethers.js
- **FHE**: Zama Relayer SDK (@zama-fhe/relayer-sdk)
- **Storage**: IPFS (Pinata)
- **Backend**: Express.js, Prisma, PostgreSQL
- **Smart Contracts**: Solidity 0.8.24, Hardhat, FHEVM
- **UI**: Framer Motion, Lucide Icons, Sonner (toasts)

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Credits

Built with:
- [Zama FHE](https://zama.ai/) - Fully Homomorphic Encryption
- [RainbowKit](https://rainbowkit.com/) - Wallet connection
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [IPFS](https://ipfs.io/) - Decentralized storage

## Links

- **GitHub**: https://github.com/anshitraj/private-ledger-flow
- **Zama Docs**: https://docs.zama.org/
- **Zama Discord**: https://discord.com/invite/fhe-org

## Support

- Open an issue on GitHub
- Join Zama Discord for FHE questions
- Check documentation in `/docs` folder

---

**Application Screenshot** 
<img width="1919" height="873" alt="image" src="https://github.com/user-attachments/assets/11331508-241d-43ca-911a-91037f5e9d18" />
<img width="1913" height="900" alt="image" src="https://github.com/user-attachments/assets/51a91dcb-b73c-495a-aa1b-c84e567cef5e" />
<img width="1919" height="896" alt="image" src="https://github.com/user-attachments/assets/bf5e2241-3814-4aae-8b1d-323d27c0fd8f" />
<img width="1919" height="901" alt="image" src="https://github.com/user-attachments/assets/977df79d-12d4-4871-8feb-6d7d544a99b7" />


**Built with ❤️ using Zama FHE technology**
