/**
 * Smart Contract Integration
 * 
 * ConfidentialExpenses Contract ABI and interaction helpers
 * Deploy contract to Sepolia and set address in .env
 */

import { parseAbiItem, keccak256, toBytes } from 'viem';

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

/**
 * Simplified ABI for ConfidentialExpenses contract
 * 
 * Expected Solidity Contract:
 * 
 * contract ConfidentialExpenses {
 *   event ExpenseAttested(
 *     bytes32 indexed submissionHash,
 *     string cid,
 *     address indexed submitter,
 *     uint256 timestamp
 *   );
 * 
 *   mapping(bytes32 => bool) public attestations;
 * 
 *   function attestExpense(bytes32 submissionHash, string memory cid) external {
 *     require(!attestations[submissionHash], "Already attested");
 *     attestations[submissionHash] = true;
 *     emit ExpenseAttested(submissionHash, cid, msg.sender, block.timestamp);
 *   }
 * 
 *   function verifyAttestation(bytes32 submissionHash) external view returns (bool) {
 *     return attestations[submissionHash];
 *   }
 * }
 */
export const CONTRACT_ABI = [
  parseAbiItem('function attestExpense(bytes32 submissionHash, string cid, bytes txMeta) external'),
  parseAbiItem('function verifyAttestation(bytes32 submissionHash) external view returns (bool)'),
  parseAbiItem('event ExpenseAttested(address indexed user, bytes32 indexed submissionHash, string cid, uint256 timestamp, bytes txMeta)'),
] as const;

export const EXPENSE_ATTESTED_EVENT = parseAbiItem(
  'event ExpenseAttested(address indexed user, bytes32 indexed submissionHash, string cid, uint256 timestamp, bytes txMeta)'
);

/**
 * Helper: Compute submission hash from CID
 * This should match the hash computed on-chain
 */
export function computeSubmissionHash(cid: string): `0x${string}` {
  return keccak256(toBytes(cid));
}

/**
 * Chain configuration for Sepolia
 */
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_NAME = 'Sepolia';
export const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';

/**
 * Validate if a string is a valid Ethereum transaction hash
 */
export function isValidTxHash(txHash: string | undefined | null): boolean {
  if (!txHash) return false;
  if (txHash === 'pending') return false;
  if (!txHash.startsWith('0x')) return false;
  if (txHash.length !== 66) return false;
  // Check if it's a valid hex string
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}

/**
 * Block explorer URL helper
 * Validates transaction hash before creating URL
 */
export function getSepoliaExplorerUrl(txHash: string): string {
  if (!isValidTxHash(txHash)) {
    throw new Error(`Invalid transaction hash: ${txHash}`);
  }
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

export function getSepoliaAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`;
}
