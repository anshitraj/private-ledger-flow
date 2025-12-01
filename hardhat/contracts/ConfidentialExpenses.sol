// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ConfidentialExpenses
 * @notice On-chain attestation contract for encrypted expenses with FHE access control
 * 
 * IMPORTANT: This contract requires compilation with Zama FHEVM Solidity compiler.
 * Use the exact import path as shown below.
 */

// NOTE: Only valid when compiling with the Zama FHEVM Solidity compiler.
// Use the FHE import exactly as below (per project guidance).
import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";

contract ConfidentialExpenses {
    
    // ============================================
    // FHE VERSION (ENABLED - For Zama FHEVM deployment)
    // ============================================
    
    // Store encrypted balances per user as FHE handles
    mapping(address => euint64[]) private fheUserBalances;
    
    // Keep fallback storage for compatibility
    mapping(address => string[]) private userCids;
    mapping(bytes32 => bool) private attestedHashes;
    
    // Events for offchain tooling and debugging
    event EncryptedAmountStored(address indexed user, bytes32 handle);
    event ExpenseAttested(
        address indexed user,
        bytes32 indexed submissionHash,
        string cid,
        uint256 timestamp,
        bytes txMeta
    );
    event PublicKeyRegistered(address indexed user, bytes publicKey);
    
    /**
     * @notice Receive an external handle + coprocessor attestation and register it
     * @param extHandle the externalEuint64 handle created offchain (from Gateway / coprocessor)
     * @param attestation signatures returned by Gateway (bytes calldata)
     * 
     * The frontend must send the external handle + coprocessor attestation to this function.
     * FHE.fromExternal performs on-chain attestation verification and returns an euint64 handle.
     */
    function storeEncryptedAmount(externalEuint64 extHandle, bytes calldata attestation) public {
        // Convert external to internal handle after verifying attestation
        euint64 handle = FHE.fromExternal(extHandle, attestation);
        
        // Keep the handle in storage
        fheUserBalances[msg.sender].push(handle);
        
        // Allow this contract to access the handle for future operations
        FHE.allow(handle, address(this));
        
        // Allow the user to decrypt their own handle via userDecrypt() in frontend
        // This is the persistent permission that Gateway will check for user decryption.
        FHE.allow(handle, msg.sender);
        
        // If you want this handle to be decryptable publicly (via publicDecrypt),
        // uncomment the line below:
        // FHE.makePubliclyDecryptable(handle);
        
        emit EncryptedAmountStored(msg.sender, FHE.toBytes32(handle));
    }
    
    /**
     * @notice Make a stored handle publicly decryptable
     * @param user address owning the handle
     * @param index index in fheUserBalances[user]
     * 
     * Use this only if you really want the value accessible via publicDecrypt.
     */
    function markPubliclyDecryptable(address user, uint256 index) public {
        euint64 handle = fheUserBalances[user][index];
        // Only the contract itself (or a privileged caller) should perform this
        // For demo, require caller = owner or some access control.
        // Mark the handle as publicly decryptable
        FHE.makePubliclyDecryptable(handle);
    }
    
    /**
     * @notice Example of performing FHE ops (non-view - required by Zama)
     * @param user address to sum balances for
     * @return sum encrypted sum of all user balances
     */
    function sumUserBalances(address user) public returns (euint64) {
        // NOTE: Avoid FHE ops in view/pure functions - must be non-view for Zama.
        euint64 sum = FHE.asEuint64(0);
        FHE.allow(sum, address(this)); // make sure contract has access to working handle
        
        for (uint i = 0; i < fheUserBalances[user].length; i++) {
            euint64 h = fheUserBalances[user][i];
            // Ensure contract is allowed to use this handle before operating
            FHE.allow(h, address(this));
            sum = FHE.add(sum, h);
            // Re-allow result for next ops
            FHE.allow(sum, address(this));
        }
        
        // Optionally allow user to read aggregated result via userDecrypt or make public:
        FHE.allow(sum, user);          // allow user-specific decryption
        // FHE.makePubliclyDecryptable(sum); // or make public
        
        return sum;
    }
    
    /**
     * @notice Get the number of encrypted balances for a user
     * @param user User address
     * @return count Number of stored encrypted balances
     */
    function getUserEncryptedBalanceCount(address user) public view returns (uint256) {
        return fheUserBalances[user].length;
    }
    
    /**
     * @notice Get handle bytes32 for a specific encrypted balance (for frontend decryption)
     * @param user User address
     * @param index Index in the balances array
     * @return handleBytes32 The handle as bytes32 for use with publicDecrypt/userDecrypt
     */
    function getEncryptedBalanceHandle(address user, uint256 index) public view returns (bytes32) {
        require(index < fheUserBalances[user].length, "Index out of bounds");
        return FHE.toBytes32(fheUserBalances[user][index]);
    }
    
    // ============================================
    // FALLBACK FUNCTIONS (for backward compatibility)
    // ============================================
    
    /**
     * @notice Attest an expense by storing CID and emitting event
     * @param submissionHash keccak256 hash of the expense metadata
     * @param cid IPFS CID of the encrypted expense blob
     * @param txMeta Optional metadata (signer, encrypted data)
     */
    function attestExpense(
        bytes32 submissionHash,
        string calldata cid,
        bytes calldata txMeta
    ) public {
        require(!attestedHashes[submissionHash], "Already attested");
        
        userCids[msg.sender].push(cid);
        attestedHashes[submissionHash] = true;
        
        emit ExpenseAttested(
            msg.sender,
            submissionHash,
            cid,
            block.timestamp,
            txMeta
        );
    }
    
    /**
     * @notice Register public key for encrypted operations
     * @param publicKey User's FHE public key (bytes)
     */
    function registerPublicKey(bytes calldata publicKey) public {
        emit PublicKeyRegistered(msg.sender, publicKey);
    }
    
    /**
     * @notice Get all CIDs for a user
     * @param user User address
     * @return Array of IPFS CIDs
     */
    function getUserCids(address user) public view returns (string[] memory) {
        return userCids[user];
    }
    
    /**
     * @notice Check if a hash has been attested
     * @param submissionHash Hash to check
     * @return True if attested
     */
    function isAttested(bytes32 submissionHash) public view returns (bool) {
        return attestedHashes[submissionHash];
    }
    
    /**
     * @notice Get total attestations for a user
     */
    function getUserAttestationCount(address user) public view returns (uint256) {
        return userCids[user].length;
    }
}

