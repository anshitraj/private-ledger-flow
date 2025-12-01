# Hardhat Smart Contracts

Smart contracts for Private Expense Tracker using Zama FHEVM.

## Contract Overview

### ConfidentialExpenses.sol

Main contract implementing FHE-based expense storage and attestation.

**Location**: `contracts/ConfidentialExpenses.sol`

## Contract Functions

### FHE Functions

#### `storeEncryptedAmount(externalEuint64 extHandle, bytes calldata attestation)`

Stores an encrypted expense amount on-chain using FHEVM.

**Parameters**:
- `extHandle`: External encrypted handle from Zama Relayer SDK
- `attestation`: Attestation proof from relayer

**Process**:
1. Converts external handle to internal `euint64` via `FHE.fromExternal()`
2. Stores handle in `fheUserBalances[msg.sender]`
3. Sets access permissions with `FHE.allow()`
4. Emits `EncryptedAmountStored` event

**Example**:
```solidity
// Frontend calls with handle and proof from relayer
storeEncryptedAmount(extHandle, attestation);
```

#### `sumUserBalances(address user) returns (euint64)`

Computes encrypted sum of all user expenses using homomorphic addition.

**Parameters**:
- `user`: Address of user to sum balances for

**Returns**: Encrypted sum as `euint64`

**Process**:
1. Initializes encrypted zero: `euint64 sum = FHE.asEuint64(0)`
2. Iterates through all user balances
3. Adds each balance using `FHE.add()`
4. Returns encrypted sum (user can decrypt)

**Example**:
```solidity
euint64 total = sumUserBalances(0xUserAddress);
// User can decrypt total to see sum of all expenses
```

#### `getEncryptedBalanceHandle(address user, uint256 index) returns (bytes32)`

Retrieves handle bytes32 for frontend decryption.

**Parameters**:
- `user`: User address
- `index`: Index in balances array

**Returns**: Handle as `bytes32` for `userDecrypt()` call

**Example**:
```solidity
bytes32 handle = getEncryptedBalanceHandle(userAddress, 0);
// Frontend uses handle with userDecrypt(handle)
```

### Attestation Functions

#### `attestExpense(bytes32 submissionHash, string calldata cid, bytes calldata txMeta)`

Attests an IPFS CID on-chain (fallback when FHE not available).

**Parameters**:
- `submissionHash`: Keccak256 hash of CID
- `cid`: IPFS Content Identifier
- `txMeta`: Optional metadata

**Process**:
1. Verifies hash not already attested
2. Stores CID in `userCids[msg.sender]`
3. Marks hash as attested
4. Emits `ExpenseAttested` event

**Example**:
```solidity
bytes32 hash = keccak256(abi.encodePacked(cid));
attestExpense(hash, cid, "");
```

### View Functions

#### `verifyAttestation(bytes32 submissionHash) returns (bool)`

Checks if a submission hash has been attested.

#### `getUserCids(address user) returns (string[])`

Returns all IPFS CIDs for a user.

#### `getUserEncryptedBalanceCount(address user) returns (uint256)`

Returns number of encrypted balances stored for a user.

#### `isAttested(bytes32 submissionHash) returns (bool)`

Checks attestation status of a hash.

## Events

### `EncryptedAmountStored(address indexed user, bytes32 handle)`

Emitted when encrypted amount is stored on-chain.

### `ExpenseAttested(address indexed user, bytes32 indexed submissionHash, string cid, uint256 timestamp, bytes txMeta)`

Emitted when expense is attested on-chain.

### `PublicKeyRegistered(address indexed user, bytes publicKey)`

Emitted when user registers public key (for future use).

## FHEVM Features Used

### Data Types

- **`euint64`**: Encrypted 64-bit unsigned integer for expense amounts
- **`externalEuint64`**: External handle from relayer (before conversion)

### Functions

- **`FHE.fromExternal()`**: Convert external handle to internal
- **`FHE.allow()`**: Set access permissions for handles
- **`FHE.add()`**: Homomorphic addition
- **`FHE.asEuint64()`**: Create encrypted zero
- **`FHE.toBytes32()`**: Convert handle to bytes32 for decryption
- **`FHE.makePubliclyDecryptable()`**: Optional public decryption

## Deployment

### Deploy to Sepolia

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export VITE_SEPOLIA_RPC_URL=your_rpc_url

# Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# Verify contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Local Development

```bash
# Start local node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

## Testing

```bash
# Run tests
npm test

# Run specific test file
npx hardhat test test/ConfidentialExpenses.test.ts

# Run with coverage
npx hardhat coverage
```

## Contract Addresses

- **Sepolia**: `0xYourContractAddress` (update after deployment)
- **Localhost**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

## Compilation

The contract requires Zama FHEVM Solidity compiler:

```bash
# Compile contracts
npx hardhat compile

# Artifacts generated in artifacts/
```

## Security Considerations

1. **Access Control**: Only users can decrypt their own expenses
2. **Attestation Verification**: Prevents duplicate attestations
3. **Handle Validation**: `FHE.fromExternal()` verifies relayer attestation
4. **Gas Optimization**: Uses efficient storage patterns

## Integration with Frontend

See [FHEVM_INTEGRATION.md](../docs/FHEVM_INTEGRATION.md) for complete integration guide.

## References

- [Zama FHEVM Documentation](https://docs.zama.org/protocol)
- [FHEVM Solidity Guide](https://docs.zama.org/protocol/solidity-guides)
- [Contract Source Code](./contracts/ConfidentialExpenses.sol)

