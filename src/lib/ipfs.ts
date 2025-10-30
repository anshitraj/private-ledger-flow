/**
 * IPFS Upload/Download Stub Implementation
 * 
 * TODO: REPLACE WITH REAL IPFS PROVIDER (Pinata, nft.storage, Web3.Storage)
 * 
 * This file contains placeholder functions for IPFS operations.
 * 
 * For Pinata:
 * npm install @pinata/sdk
 * 
 * Example Pinata Implementation:
 * ```typescript
 * import pinataSDK from '@pinata/sdk';
 * const pinata = new pinataSDK({ pinataJWTKey: process.env.VITE_IPFS_API_KEY });
 * 
 * export async function uploadToIPFS(data: Uint8Array): Promise<string> {
 *   const result = await pinata.pinFileToIPFS(new Blob([data]));
 *   return result.IpfsHash;
 * }
 * ```
 * 
 * For nft.storage:
 * npm install nft.storage
 * 
 * Example nft.storage Implementation:
 * ```typescript
 * import { NFTStorage, File } from 'nft.storage';
 * const client = new NFTStorage({ token: process.env.VITE_IPFS_API_KEY });
 * 
 * export async function uploadToIPFS(data: Uint8Array): Promise<string> {
 *   const file = new File([data], 'expense.enc');
 *   const cid = await client.storeBlob(file);
 *   return cid;
 * }
 * ```
 */

const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

/**
 * Mock IPFS upload
 * Returns a fake CID
 * 
 * REPLACE WITH: Pinata JWT upload or nft.storage API call
 */
export async function uploadToIPFS(data: Uint8Array): Promise<string> {
  // Simulate upload latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate mock CID (in production, this comes from IPFS provider)
  const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

  console.log('📦 [IPFS STUB] Uploaded to IPFS:', {
    cid: mockCid,
    size: data.length,
    note: 'REPLACE WITH PINATA/NFT.STORAGE',
    expectedApiCall: {
      endpoint: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_PINATA_JWT',
      },
      body: 'FormData with file',
    }
  });

  // In a real implementation, store in localStorage as a mock persistence
  // (Remove this in production)
  try {
    localStorage.setItem(`ipfs_${mockCid}`, JSON.stringify(Array.from(data)));
  } catch (e) {
    console.warn('LocalStorage mock storage failed:', e);
  }

  return mockCid;
}

/**
 * Mock IPFS download
 * Retrieves data by CID
 * 
 * REPLACE WITH: Fetch from IPFS gateway or direct provider API
 */
export async function downloadFromIPFS(cid: string): Promise<Uint8Array> {
  // Simulate download latency
  await new Promise(resolve => setTimeout(resolve, 600));

  console.log('📥 [IPFS STUB] Downloading from IPFS:', {
    cid,
    note: 'REPLACE WITH IPFS GATEWAY FETCH',
    expectedUrl: `${IPFS_GATEWAY}${cid}`
  });

  // Try to get from localStorage mock (remove in production)
  try {
    const stored = localStorage.getItem(`ipfs_${cid}`);
    if (stored) {
      const dataArray = JSON.parse(stored);
      return new Uint8Array(dataArray);
    }
  } catch (e) {
    console.warn('LocalStorage mock retrieval failed:', e);
  }

  // Fallback: return empty data
  // In production, fetch from gateway:
  // const response = await fetch(`${IPFS_GATEWAY}${cid}`);
  // return new Uint8Array(await response.arrayBuffer());
  
  throw new Error(`CID not found in mock storage: ${cid}`);
}

/**
 * Helper: Get IPFS gateway URL for a CID
 */
export function getIPFSUrl(cid: string): string {
  return `${IPFS_GATEWAY}${cid}`;
}

/**
 * Utility: Check if CID is valid format
 */
export function isValidCID(cid: string): boolean {
  // Basic CID validation (v0 and v1)
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/.test(cid) || /^b[A-Za-z2-7]{58,}$/.test(cid);
}
