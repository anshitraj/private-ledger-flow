# Private Expense Tracker - User Guide

Complete guide for using the Private Expense Tracker as an end user.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Home Page Navigation](#home-page-navigation)
3. [Adding Expenses](#adding-expenses)
4. [Viewing Records](#viewing-records)
5. [Dashboard Overview](#dashboard-overview)
6. [Decrypting Expenses](#decrypting-expenses)
7. [Verifying Attestations](#verifying-attestations)
8. [Privacy & Security](#privacy--security)
9. [FAQ & Troubleshooting](#faq--troubleshooting)

## Getting Started

### Prerequisites

- **Web3 Wallet**: MetaMask, WalletConnect, or compatible wallet
- **Sepolia Testnet ETH**: For on-chain transactions
- **Modern Browser**: Chrome, Firefox, Edge, or Brave

### First Time Setup

1. **Connect Your Wallet**
   - Click "Connect Wallet" button
   - Select your preferred wallet (MetaMask, WalletConnect, etc.)
   - Approve connection request
   - Ensure you're on Sepolia testnet

2. **Verify Network**
   - The app automatically checks if you're on Sepolia
   - If not, you'll see a prompt to switch networks
   - Click "Switch Network" to connect to Sepolia

3. **Ready to Use**
   - Once connected, you can start adding expenses
   - Your wallet address will be displayed in the header

## Home Page Navigation

### Main Sections

- **Dashboard**: Overview of your expenses and statistics
- **Add Expense**: Create new encrypted expense entries
- **Records**: View all your attested expenses
- **Verify**: Verify on-chain attestations using IPFS CIDs

### Navigation Bar

- **Top Bar**: Wallet connection, network status, user address
- **Left Sidebar**: Quick navigation between pages (desktop)
- **Bottom Nav**: Mobile-friendly navigation menu

## Adding Expenses

### Step-by-Step Process

1. **Click "Add Expense" Button**
   - Located on Dashboard or in navigation menu
   - Opens expense creation modal

2. **Fill in Expense Details**
   - **Amount**: Enter expense amount (e.g., 100.50)
   - **Currency**: Select currency (USD, EUR, etc.)
   - **Category**: Choose category (Food, Travel, etc.)
   - **Note** (Optional): Add description or memo

3. **Encryption Process**
   - Click "Add Expense" button
   - App encrypts your amount using Zama FHE
   - You'll see "Encrypting..." status
   - Process takes 2-5 seconds

4. **IPFS Upload**
   - Encrypted data is uploaded to IPFS
   - You'll see "Uploading..." status
   - Receives Content Identifier (CID)

5. **On-chain Attestation**
   - Transaction submitted to Sepolia blockchain
   - You'll see "Attesting..." status
   - Approve transaction in your wallet
   - Wait for confirmation (usually 10-30 seconds)

6. **Success**
   - Expense appears in your Records
   - Transaction hash displayed
   - You can verify it on Etherscan

### Understanding Encryption Status

- **✅ Real FHE Encryption**: When relayer accepts, uses `storeEncryptedAmount`
- **⚠️ Mock Encryption**: When relayer unavailable, uses fallback encryption
- Both methods protect your privacy via IPFS encryption

## Viewing Records

### Records Page Features

- **All Expenses**: Complete list of your attested expenses
- **Filter by Category**: Filter expenses by category
- **Search**: Search by CID or transaction hash
- **Sort Options**: Sort by date, amount, category

### Expense Card Information

Each expense card shows:
- **CID**: IPFS Content Identifier
- **Transaction Hash**: Link to Etherscan
- **Timestamp**: When expense was created
- **Category**: Expense category
- **Status**: Confirmed, Pending, or Failed

### Actions Available

- **Decrypt**: Decrypt and view plaintext amount (see below)
- **Verify**: Open verification page for this expense
- **View on Etherscan**: Open transaction in block explorer

## Dashboard Overview

### Statistics Displayed

- **Total Expenses**: Number of expenses you've created
- **Total Amount**: Sum of all expenses (if decrypted)
- **By Category**: Breakdown by expense category
- **Recent Activity**: Latest expenses added

### Charts & Visualizations

- **Category Distribution**: Pie chart showing expense categories
- **Time Series**: Line chart showing expenses over time
- **Monthly Summary**: Bar chart of monthly totals

## Decrypting Expenses

### How to Decrypt

1. **Go to Records Page**
   - Navigate to "Records" from main menu

2. **Find Your Expense**
   - Scroll or search for the expense you want to decrypt

3. **Click "Decrypt" Button**
   - Located on each expense card
   - Only you can decrypt your own expenses

4. **Decryption Process**
   - App downloads encrypted data from IPFS
   - Decrypts using Zama SDK
   - Displays plaintext amount

5. **View Result**
   - Plaintext amount shown in toast notification
   - Amount also displayed in expense card

### Privacy Note

- **Only You Can Decrypt**: Your expenses are encrypted with your wallet
- **No One Else Sees**: Even the contract can't see plaintext amounts
- **Local Decryption**: Decryption happens in your browser

## Verifying Attestations

### What is Verification?

Verification confirms that your expense was properly attested on the blockchain and stored on IPFS.

### How to Verify

1. **Go to Verify Page**
   - Click "Verify" in navigation menu

2. **Enter IPFS CID**
   - Copy CID from your expense record
   - Paste into verification input
   - Click "Verify"

3. **View Results**
   - **✅ Verified**: Expense is attested on-chain
   - **❌ Not Found**: Expense not found or not attested
   - **Transaction Details**: Link to Etherscan transaction

### Verification Information Displayed

- **CID**: IPFS Content Identifier
- **Submission Hash**: Keccak256 hash of CID
- **Attestation Status**: Verified or Not Verified
- **Transaction Hash**: Link to on-chain transaction
- **Block Number**: Block where transaction was included
- **Timestamp**: When expense was attested

## Privacy & Security

### What is Encrypted?

- ✅ **Expense Amounts**: Fully encrypted using FHE
- ✅ **IPFS Data**: Complete encrypted payload
- ✅ **User Balances**: Encrypted totals

### What is Public?

- ✅ **IPFS CIDs**: Public identifiers (content is encrypted)
- ✅ **Transaction Hashes**: On-chain verification
- ✅ **Timestamps**: When expenses were created
- ✅ **Categories**: Optional metadata

### Security Features

- **Wallet-Based Encryption**: Only your wallet can decrypt
- **On-chain Verification**: Immutable attestation records
- **IPFS Storage**: Decentralized, censorship-resistant storage
- **No Central Server**: Your data isn't stored on our servers

### Best Practices

1. **Keep Your Wallet Secure**
   - Never share your private key
   - Use hardware wallet for large amounts
   - Enable 2FA on wallet apps

2. **Verify Transactions**
   - Always check transaction hashes on Etherscan
   - Verify IPFS CIDs match your records
   - Keep backup of important CIDs

3. **Network Security**
   - Only use on Sepolia testnet (for testing)
   - Verify you're on correct network
   - Don't use mainnet until production-ready

## FAQ & Troubleshooting

### General Questions

**Q: Do I need to pay gas fees?**
A: Yes, you need Sepolia testnet ETH for on-chain transactions. Get free testnet ETH from faucets.

**Q: Can I use this on mainnet?**
A: Currently deployed on Sepolia testnet only. Mainnet deployment requires contract whitelisting with Zama.

**Q: What happens if encryption fails?**
A: App automatically falls back to mock encryption. Your data is still encrypted and stored on IPFS.

**Q: Can I delete expenses?**
A: No, blockchain transactions are immutable. You can add new expenses but cannot delete existing ones.

### Technical Issues

**Q: Wallet won't connect**
- Check if wallet extension is installed
- Refresh page and try again
- Clear browser cache if issues persist

**Q: Transaction fails**
- Ensure you have enough Sepolia ETH
- Check network is set to Sepolia
- Increase gas limit if needed

**Q: Decryption fails**
- Verify IPFS CID is correct
- Check if data exists on IPFS
- Try refreshing and decrypting again

**Q: Can't see my expenses**
- Check wallet is connected
- Verify you're on correct network
- Refresh page or clear cache

### Privacy Questions

**Q: Who can see my expenses?**
A: Only you can decrypt your expenses. CIDs and transaction hashes are public, but amounts are encrypted.

**Q: Is my data stored on your servers?**
A: No, your data is stored on IPFS (decentralized) and blockchain (public ledger with encrypted data).

**Q: Can the contract see my amounts?**
A: No, the contract only sees encrypted handles. It can perform operations but cannot decrypt.

**Q: What if I lose my wallet?**
A: You'll lose access to decrypt your expenses. Keep your wallet seed phrase safe and backed up.

## Support

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check `/docs` folder for technical details
- **Zama Discord**: Join for FHE-related questions

---

**Built with ❤️ using Zama FHE technology**

