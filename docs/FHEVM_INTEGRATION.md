# Zama FHEVM Integration Documentation

## Overview

This Private Expense Tracker leverages Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine) to provide complete privacy for user expense amounts, categories, and metadata while maintaining verifiable on-chain attestations. All sensitive financial data remains encrypted throughout the entire lifecycle - from encryption to storage to computation.

## Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "FRONTEND (React + Vite)"
        A[User Interface] --> B[Wallet Connection<br/>Wagmi/RainbowKit]
        A --> C[Zama Relayer SDK<br/>@zama-fhe/relayer-sdk]
        A --> D[IPFS Client<br/>Encrypted Data Storage]
        C --> E[Encryption Keypair<br/>Generation]
        C --> F[Encrypted Input Buffer<br/>createEncryptedInput]
        F --> G[Encrypted Handles<br/>+ Input Proofs]
    end
    
    subgraph "SMART CONTRACTS (Solidity + FHEVM)"
        H[ConfidentialExpenses.sol] --> I[storeEncryptedAmount<br/>euint64 Storage]
        H --> J[attestExpense<br/>IPFS CID Attestation]
        H --> K[sumUserBalances<br/>Homomorphic Addition]
        H --> L[getEncryptedBalanceHandle<br/>Retrieve for Decryption]
        I --> M[FHE.fromExternal<br/>Handle Conversion]
        K --> N[FHE.add<br/>Encrypted Arithmetic]
    end
    
    subgraph "ZAMA INFRASTRUCTURE"
        O[Gateway<br/>Encrypted Input Handler] --> P[KMS<br/>Key Management System]
        P --> Q[Coprocessor<br/>FHE Computations]
        Q --> R[Relayer<br/>Decryption Service]
    end
    
    subgraph "BACKEND (Express.js)"
        S[IPFS Pinning<br/>Pinata Integration] --> T[Database<br/>PostgreSQL + Prisma]
        S --> U[Event Listener<br/>Blockchain Indexing]
        T --> V[REST API<br/>Frontend Endpoints]
    end
    
    G -->|Encrypted Data + Proofs| H
    H -->|Decryption Requests| R
    D -->|Encrypted Payloads| S
    S -->|CIDs + Metadata| T
    V -->|API Responses| A
    R -->|Decrypted Results| A
    
    style A fill:#f9d71c,stroke:#333,stroke-width:2px
    style H fill:#4a90e2,stroke:#333,stroke-width:2px
    style O fill:#9b59b6,stroke:#333,stroke-width:2px
    style S fill:#2ecc71,stroke:#333,stroke-width:2px
```

### System Components

1. **Frontend (React + Vite)**
   - Wallet connection via Wagmi/RainbowKit
   - Zama Relayer SDK integration for FHE operations
   - IPFS upload/download for encrypted data storage
   - On-chain transaction submission

2. **Smart Contract (Solidity + FHEVM)**
   - `ConfidentialExpenses.sol` - Main contract with FHE support
   - Stores encrypted amounts as `euint64` handles
   - Provides attestation for IPFS CIDs
   - Supports homomorphic operations on encrypted data

3. **Backend (Express.js)**
   - IPFS pinning service (Pinata integration)
   - Database storage (PostgreSQL via Prisma)
   - Blockchain event listener
   - REST API for frontend

4. **Zama Infrastructure**
   - Gateway: Handles encrypted inputs from frontend
   - KMS: Manages FHE encryption keys
   - Coprocessor: Performs FHE computations
   - Relayer: Returns decrypted results via callbacks

## FHEVM Features Used

### Encrypted Data Types

| FHE Type | Usage | Location | Description |
|----------|-------|----------|-------------|
| `euint64` | User balances, expense amounts, totals | `ConfidentialExpenses.sol` | 64-bit encrypted integers for financial amounts |
| `euint32` | Counters, indices | `ConfidentialExpenses.sol` | 32-bit encrypted integers for metadata |
| `euint8` | Flags, small values | `ConfidentialExpenses.sol` | 8-bit encrypted integers for compact data |
| `ebool` | Validation results, conditional logic | `ConfidentialExpenses.sol` | Encrypted boolean values for privacy-preserving conditions |
| `externalEuint64` | Input from relayer | Frontend → Contract | External encrypted handles from Zama Relayer SDK |

### Core FHEVM Operations

#### 1. Encryption Operations

**Plaintext to Encrypted:**
```solidity
euint64 encrypted = FHE.asEuint64(0);  // Initialize encrypted zero
```

**Import External Encrypted Data:**
```solidity
euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
```

#### 2. Encrypted Arithmetic

**Addition:**
```solidity
euint64 totalPool = FHE.add(currentPool, newAmount);
```

**Subtraction:**
```solidity
euint64 newBalance = FHE.sub(currentBalance, betAmount);
```

**Conditional Selection:**
```solidity
euint64 result = FHE.select(condition, ifTrue, ifFalse);
```

#### 3. Encrypted Comparisons

**Greater Than or Equal:**
```solidity
ebool isValid = FHE.ge(balance, amount);
```

**Less Than or Equal:**
```solidity
ebool withinLimit = FHE.le(optionIndex, maxOptions);
```

**Equality Check:**
```solidity
ebool isMatch = FHE.eq(userChoice, winningOption);
```

**Logical AND:**
```solidity
ebool allValid = FHE.and(condition1, condition2);
```

### 1. Encrypted Amount Storage (`euint64`)

**Purpose**: Store expense amounts in encrypted form on-chain

**Implementation**:
```solidity
mapping(address => euint64[]) private fheUserBalances;

function storeEncryptedAmount(externalEuint64 extHandle, bytes calldata attestation) public {
    euint64 handle = FHE.fromExternal(extHandle, attestation);
    fheUserBalances[msg.sender].push(handle);
    FHE.allow(handle, address(this));
    FHE.allow(handle, msg.sender);
    emit EncryptedAmountStored(msg.sender, FHE.toBytes32(handle));
}
```

**Frontend Flow**:
1. User enters expense amount
2. Frontend calls `createEncryptedInput(contractAddress, userAddress)`
3. Adds amount with `buffer.add64(BigInt(amount))`
4. Calls `buffer.encrypt()` to get `{ handles, inputProof }`
5. Calls `storeEncryptedAmount(handle, inputProof)` on contract
6. Contract verifies attestation and stores encrypted handle

### 2. Homomorphic Addition

**Purpose**: Compute encrypted totals without decryption

**Implementation**:
```solidity
function sumUserBalances(address user) public returns (euint64) {
    euint64 sum = FHE.asEuint64(0);
    FHE.allow(sum, address(this));
    
    for (uint i = 0; i < fheUserBalances[user].length; i++) {
        euint64 h = fheUserBalances[user][i];
        FHE.allow(h, address(this));
        sum = FHE.add(sum, h);
        FHE.allow(sum, address(this));
    }
    
    FHE.allow(sum, user);
    return sum;
}
```

**Use Case**: Calculate total expenses for a user without revealing individual amounts

### 3. Access Control (FHE.allow)

**Purpose**: Control who can decrypt or operate on encrypted data

**Patterns Used**:
- `FHE.allow(handle, address(this))` - Contract can operate on handle
- `FHE.allow(handle, msg.sender)` - User can decrypt their own data
- `FHE.makePubliclyDecryptable(handle)` - Optional public decryption

### 4. External Handle Conversion

**Purpose**: Convert off-chain encrypted inputs to on-chain handles

**Flow**:
1. Frontend creates encrypted input via Zama Relayer SDK
2. Relayer returns `externalEuint64` handle + attestation proof
3. Contract calls `FHE.fromExternal(extHandle, attestation)`
4. Returns `euint64` handle for on-chain operations

## Contract-by-Contract Breakdown

### ConfidentialExpenses.sol

```mermaid
graph LR
    subgraph "Contract Functions"
        A[storeEncryptedAmount] --> B[FHE.fromExternal]
        B --> C[Store euint64]
        C --> D[FHE.allow]
        
        E[attestExpense] --> F[Store CID]
        F --> G[Emit Event]
        
        H[sumUserBalances] --> I[FHE.add Loop]
        I --> J[Return euint64]
        
        K[getEncryptedBalanceHandle] --> L[Return bytes32]
    end
    
    style A fill:#4a90e2,stroke:#333,stroke-width:2px,color:#fff
    style H fill:#9b59b6,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#2ecc71,stroke:#333,stroke-width:2px,color:#fff
```

**Main Functions**:

1. **`storeEncryptedAmount(externalEuint64, bytes)`**
   - Receives encrypted amount from frontend
   - Verifies relayer attestation
   - Stores as `euint64` handle
   - Sets up access permissions

2. **`attestExpense(bytes32, string, bytes)`**
   - Fallback function for IPFS CID attestation
   - Stores CID for verification
   - Emits event for off-chain indexing

3. **`sumUserBalances(address)`**
   - Homomorphic addition of all user expenses
   - Returns encrypted sum
   - User can decrypt result

4. **`getEncryptedBalanceHandle(address, uint256)`**
   - Retrieves handle bytes32 for decryption
   - Used by frontend for `userDecrypt()` calls

## Frontend Integration Flow

### Encryption Workflow

```typescript
// 1. Initialize Zama SDK
const instance = await getZamaInstance();

// 2. Create encrypted input buffer
const buffer = instance.createEncryptedInput(contractAddress, userAddress);

// 3. Add expense amount
buffer.add64(BigInt(Math.floor(amount)));

// 4. Encrypt and get handle + proof
const { handles, inputProof } = await buffer.encrypt();

// 5. Store handle and proof for contract call
const fheHandle = handles[0];
const attestation = inputProof;
```

### Contract Interaction

```typescript
// Option 1: Store encrypted amount (FHE)
if (usesFHE && fheHandle && inputProof) {
    writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'storeEncryptedAmount',
        args: [handleBytes, attestationBytes],
    });
}

// Option 2: Attest IPFS CID (fallback)
else {
    writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'attestExpense',
        args: [submissionHash, cid, txMeta],
    });
}
```

### Decryption Workflow

```typescript
// 1. Get handle from contract
const handleBytes32 = await contract.getEncryptedBalanceHandle(userAddress, index);

// 2. Decrypt using Zama SDK
const decrypted = await instance.userDecrypt(handleBytes32);

// 3. Display to user
console.log('Decrypted amount:', decrypted);
```

## Complete User Journeys

### Journey 1: Adding an Encrypted Expense

```mermaid
journey
    title Adding an Encrypted Expense
    section User Input
      User enters expense: 5: User
      Amount: $100, Category: Food: 5: User
    section Encryption
      Zama SDK encrypts: 4: Frontend
      Create encrypted input: 4: Frontend
      Get handles + proof: 4: Zama Relayer
    section Storage
      Upload to IPFS: 3: Frontend
      Receive CID: 3: IPFS
    section On-chain
      Store encrypted amount: 4: Contract
      Transaction confirmed: 5: Blockchain
    section Backend
      Save record: 3: Backend
      Index event: 3: Backend
```

**Detailed Steps:**
1. **User Action**: Enters expense amount ($100), category, note
2. **Encryption**: Frontend encrypts amount using Zama Relayer SDK
3. **Storage**: Encrypted data uploaded to IPFS → receives CID
4. **On-chain**: 
   - If FHE succeeds: Calls `storeEncryptedAmount(handle, proof)`
   - If FHE fails: Calls `attestExpense(hash, cid, meta)` (fallback)
5. **Verification**: Transaction confirmed, event emitted
6. **Database**: Backend saves record with CID and transaction hash

### Journey 2: Viewing Encrypted Expenses

```mermaid
flowchart TD
    A[User Opens Records Page] --> B[Fetch from Backend API]
    B --> C[Display Encrypted Expenses]
    C --> D[Show CID, Hash, Timestamp]
    D --> E{User Clicks Decrypt?}
    E -->|Yes| F[Download from IPFS]
    E -->|No| G[View Encrypted Data Only]
    F --> H[Get Handle from Contract]
    H --> I[Zama SDK Decrypt]
    I --> J[Display Plaintext Amount]
    
    style E fill:#4a90e2,stroke:#333,stroke-width:2px
    style I fill:#9b59b6,stroke:#333,stroke-width:2px
    style J fill:#6bcf7f,stroke:#333,stroke-width:2px
```

**Detailed Steps:**
1. **User Action**: Opens Records page
2. **Fetch**: Frontend fetches records from backend API
3. **Display**: Shows encrypted expenses with CID, hash, timestamp
4. **Decryption**: User clicks "Decrypt" → downloads from IPFS → decrypts locally
5. **Result**: Plaintext amount displayed only to user

### Journey 3: Computing Encrypted Totals

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Contract
    participant ZamaRelayer
    
    User->>Frontend: View Dashboard
    Frontend->>Contract: sumUserBalances(userAddress)
    Contract->>Contract: Loop through encrypted amounts
    Contract->>Contract: FHE.add(sum, amount)
    Contract-->>Frontend: Encrypted total (euint64)
    Frontend->>ZamaRelayer: userDecrypt(encryptedTotal)
    ZamaRelayer-->>Frontend: Decrypted total
    Frontend->>User: Display total expenses
```

**Detailed Steps:**
1. **User Action**: Views dashboard
2. **Contract Call**: Frontend calls `sumUserBalances(userAddress)`
3. **Homomorphic Operation**: Contract adds all encrypted amounts
4. **Result**: Returns encrypted sum
5. **Decryption**: User decrypts sum to see total expenses

## Encryption Flow Diagrams

### Standard Encryption Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ZamaRelayer
    participant Contract
    participant IPFS
    participant Backend
    
    User->>Frontend: Enter expense ($100)
    Frontend->>ZamaRelayer: createEncryptedInput(contract, user)
    ZamaRelayer-->>Frontend: Buffer created
    Frontend->>ZamaRelayer: buffer.add64(BigInt(100))
    Frontend->>ZamaRelayer: buffer.encrypt()
    ZamaRelayer-->>Frontend: { handles: [handle], inputProof }
    Frontend->>IPFS: Upload encrypted payload
    IPFS-->>Frontend: CID returned
    Frontend->>Contract: storeEncryptedAmount(handle, proof)
    Contract->>Contract: FHE.fromExternal(handle, proof)
    Contract->>Contract: Store euint64 handle
    Contract-->>Frontend: EncryptedAmountStored event
    Frontend->>Backend: POST /api/records (CID, hash)
    Backend-->>Frontend: Record saved
```

### Fallback Flow (Mock Encryption)

```mermaid
flowchart TD
    A[User Input: $100] --> B[Zama Relayer SDK]
    B --> C{createEncryptedInput<br/>Success?}
    C -->|Yes| D[Get handles + proof]
    C -->|No| E[Relayer Rejection]
    E --> F[Fallback: Mock Encryption]
    F --> G[Encrypt Locally]
    G --> H[Upload to IPFS]
    H --> I[Get CID]
    D --> J[storeEncryptedAmount<br/>handle, proof]
    I --> K[attestExpense<br/>hash, CID, meta]
    J --> L[EncryptedAmountStored Event]
    K --> M[ExpenseAttested Event]
    L --> N[Backend Indexes]
    M --> N
    
    style E fill:#ff6b6b,stroke:#333,stroke-width:2px
    style F fill:#ffd93d,stroke:#333,stroke-width:2px
    style D fill:#6bcf7f,stroke:#333,stroke-width:2px
```

### Decryption Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant IPFS
    participant ZamaRelayer
    participant Contract
    
    User->>Frontend: Click "Decrypt"
    Frontend->>Backend: GET /api/records/:cid
    Backend-->>Frontend: Expense record with CID
    Frontend->>IPFS: Download encrypted payload (CID)
    IPFS-->>Frontend: Encrypted data blob
    Frontend->>Contract: getEncryptedBalanceHandle(user, index)
    Contract-->>Frontend: Handle bytes32
    Frontend->>ZamaRelayer: userDecrypt(handle, contract)
    ZamaRelayer-->>Frontend: Decrypted amount
    Frontend->>User: Display plaintext amount
```

### Homomorphic Aggregation Flow

```mermaid
flowchart LR
    A[User Expenses] --> B[Encrypted Amount 1<br/>euint64]
    A --> C[Encrypted Amount 2<br/>euint64]
    A --> D[Encrypted Amount 3<br/>euint64]
    B --> E[sumUserBalances<br/>Function]
    C --> E
    D --> E
    E --> F[FHE.add Operations<br/>No Decryption]
    F --> G[Encrypted Total<br/>euint64]
    G --> H[User Decrypts<br/>Result]
    H --> I[Plaintext Total<br/>Displayed]
    
    style E fill:#4a90e2,stroke:#333,stroke-width:3px
    style F fill:#9b59b6,stroke:#333,stroke-width:2px
    style G fill:#f9d71c,stroke:#333,stroke-width:2px
```

## Privacy Architecture

### Data Privacy Matrix

```mermaid
graph TB
    subgraph "ENCRYPTED DATA 🔒"
        A[Expense Amounts<br/>euint64 on-chain]
        B[IPFS Payload<br/>Full encrypted data]
        C[User Balances<br/>Encrypted totals]
        D[Metadata<br/>Categories, Notes]
    end
    
    subgraph "PUBLIC DATA 🌐"
        E[IPFS CIDs<br/>Content identifiers]
        F[Transaction Hashes<br/>On-chain verification]
        G[Timestamps<br/>When created]
        H[User Addresses<br/>Wallet addresses]
    end
    
    subgraph "ACCESS CONTROL 🔑"
        I[User Decryption<br/>Only creator]
        J[Contract Operations<br/>Homomorphic compute]
        K[Public Decryption<br/>Optional]
    end
    
    A --> I
    B --> I
    C --> I
    D --> I
    A --> J
    C --> J
    A -.Optional.-> K
    
    style A fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#6bcf7f,stroke:#333,stroke-width:2px
    style F fill:#6bcf7f,stroke:#333,stroke-width:2px
    style I fill:#4a90e2,stroke:#333,stroke-width:2px,color:#fff
```

### What is Encrypted

- ✅ **Expense Amounts**: Encrypted as `euint64` on-chain
- ✅ **IPFS Data**: Full encrypted payload (amount + metadata)
- ✅ **User Balances**: Encrypted totals for privacy

### What is Public

- ✅ **IPFS CIDs**: Public identifiers (content is encrypted)
- ✅ **Transaction Hashes**: On-chain verification
- ✅ **Timestamps**: When expenses were created
- ✅ **Categories**: Optional (can be encrypted if needed)

### Access Control

- **User Decryption**: Only the expense creator can decrypt their own amounts
- **Contract Operations**: Contract can perform homomorphic operations
- **Public Decryption**: Optional via `makePubliclyDecryptable()`

## Relayer Integration

### Zama Relayer SDK

**Configuration**:
- Relayer URL: `https://relayer.testnet.zama.org`
- Network: Sepolia (Chain ID: 11155111)
- Gateway Chain ID: 55815

**Key Methods**:
- `createEncryptedInput(contract, user)` - Create input buffer
- `buffer.add64(value)` - Add encrypted value
- `buffer.encrypt()` - Encrypt and get handle + proof
- `userDecrypt(handle)` - Decrypt user's data
- `publicDecrypt(handle)` - Decrypt publicly accessible data

### Relayer Callbacks

When `createEncryptedInput` succeeds:
- Relayer validates contract whitelist
- Generates encrypted handle
- Creates attestation proof
- Returns `{ handles, inputProof }`

When relayer rejects:
- Frontend falls back to mock encryption
- Uses `attestExpense` for on-chain verification
- Still maintains privacy via IPFS encryption

## Testing & Validation

### Unit Tests

```typescript
// Test encryption
const encrypted = await encryptExpenseWithFHE({
    amount: 100,
    currency: 'USD',
    category: 'food',
    timestamp: Date.now()
});

// Verify structure
expect(encrypted.ciphertextBlob).toBeDefined();
expect(encrypted.ciphertextPreviewHash).toBeDefined();
```

### Integration Tests

1. Deploy contract to Sepolia
2. Connect wallet
3. Create encrypted expense
4. Verify on-chain event
5. Decrypt and verify amount

### Manual Testing

1. **Encryption Test**: Create expense → verify IPFS upload → check CID
2. **Decryption Test**: Click decrypt → verify plaintext matches input
3. **On-chain Test**: Verify transaction on Etherscan → check event logs

## Troubleshooting

### Common Issues

1. **Relayer Rejection**
   - **Cause**: Contract not whitelisted
   - **Solution**: App falls back to mock encryption automatically

2. **Decryption Fails**
   - **Cause**: Handle not found or wrong permissions
   - **Solution**: Check `FHE.allow()` calls in contract

3. **IPFS Upload Fails**
   - **Cause**: Pinata API keys invalid
   - **Solution**: Verify environment variables

## Future Enhancements

- [ ] Encrypt categories and notes with FHE
- [ ] Add homomorphic comparison operations
- [ ] Implement encrypted expense filtering
- [ ] Add multi-user encrypted sharing
- [ ] Support encrypted expense reports

## References

- [Zama FHEVM Documentation](https://docs.zama.org/protocol)
- [Zama Relayer SDK Guide](https://docs.zama.org/protocol/relayer-sdk-guides)
- [FHEVM Solidity Guide](https://docs.zama.org/protocol/solidity-guides)
- [Contract Source Code](../hardhat/contracts/ConfidentialExpenses.sol)

