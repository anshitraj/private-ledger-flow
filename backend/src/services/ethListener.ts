import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ABI for ConfidentialExpenses contract
const CONTRACT_ABI = [
  "event ExpenseAttested(address indexed user, bytes32 indexed submissionHash, string cid, uint256 timestamp, bytes txMeta)",
  "function attestExpense(bytes32 submissionHash, string calldata cid, bytes calldata txMeta) external",
  "function isAttested(bytes32 submissionHash) external view returns (bool)",
];

interface ListenerState {
  running: boolean;
  provider: ethers.Provider | null;
  contract: ethers.Contract | null;
}

const state: ListenerState = {
  running: false,
  provider: null,
  contract: null,
};

class EthListener {
  /**
   * Start listening to contract events
   */
  async start() {
    if (state.running) {
      console.log("⚠️ Listener already running");
      return;
    }
    
    const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.VITE_SEPOLIA_RPC_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS || process.env.VITE_CONTRACT_ADDRESS;
    
    if (!rpcUrl || !contractAddress) {
      console.error("❌ Missing RPC_URL or CONTRACT_ADDRESS in environment");
      return;
    }
    
    try {
      state.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      if (!state.provider) {
        throw new Error('Failed to create provider');
      }
      
      state.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, state.provider);
      
      // Subscribe to events
      state.contract.on("ExpenseAttested", async (
        user: string,
        submissionHash: string,
        cid: string,
        timestamp: bigint,
        txMeta: string
      ) => {
        await this.handleExpenseAttested(user, submissionHash, cid, timestamp, txMeta);
      });
      
      state.running = true;
      console.log(`✅ Ethereum listener started on contract ${contractAddress}`);
      
      // Process recent events (last 10 blocks for free tier)
      await this.processRecentEvents();
      console.log(`📊 Historical events processed (last 10 blocks)`);
      
    } catch (error: any) {
      console.error("❌ Failed to start listener:", error.message);
    }
  }
  
  /**
   * Handle ExpenseAttested event
   */
  private async handleExpenseAttested(
    user: string,
    submissionHash: string,
    cid: string,
    timestamp: bigint,
    txMeta: string
  ) {
    try {
      // Store in database (skip txHash lookup for now due to free tier limits)
      await prisma.expense.upsert({
        where: { cid },
        create: {
          userAddress: user.toLowerCase(),
          cid,
          submissionHash,
          txHash: "pending", // Will be updated when available
          blockNumber: null,
          timestamp: new Date(Number(timestamp) * 1000),
          status: "confirmed",
        },
        update: {
          status: "confirmed",
        },
      });
      
      console.log(`✅ Indexed expense: ${cid} from ${user}`);
    } catch (error: any) {
      console.error("Error handling event:", error.message);
    }
  }
  
  /**
   * Get transaction hash for event
   */
  private async getEventTxHash(submissionHash: string): Promise<string | null> {
    try {
      // Query recent blocks to find the event (10 block limit for free tier)
      const currentBlock = await state.provider!.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10);
      
      const events = await state.contract!.queryFilter(
        state.contract!.filters.ExpenseAttested(null, submissionHash),
        fromBlock,
        currentBlock
      );
      
      const event = events[0];
      if (event) {
        // In ethers v6, both Log and EventLog have transactionHash
        return (event as ethers.Log).transactionHash || null;
      }
      return null;
    } catch {
      return null;
    }
  }
  
  /**
   * Get block number for event
   */
  private async getEventBlockNumber(submissionHash: string): Promise<number | null> {
    try {
      const currentBlock = await state.provider!.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10); // Free tier limit
      
      const events = await state.contract!.queryFilter(
        state.contract!.filters.ExpenseAttested(null, submissionHash),
        fromBlock,
        currentBlock
      );
      
      return events[0]?.blockNumber || null;
    } catch {
      return null;
    }
  }
  
  /**
   * Process recent events (last 10 blocks for free tier)
   */
  private async processRecentEvents() {
    try {
      const currentBlock = await state.provider!.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10); // Free tier limit
      
      console.log(`📊 Processing events from blocks ${fromBlock} to ${currentBlock} (free tier: 10 blocks)`);
      
      const events = await state.contract!.queryFilter(
        state.contract!.filters.ExpenseAttested(),
        fromBlock,
        currentBlock
      );
      
      console.log(`Found ${events.length} events to process`);
      
      for (const event of events) {
        if ('args' in event && event.args) {
          const { user, submissionHash, cid, timestamp, txMeta } = event.args as any;
          await this.handleExpenseAttested(user, submissionHash, cid, timestamp, txMeta);
        }
      }
    } catch (error: any) {
      console.error("Error processing recent events:", error);
    }
  }

  /**
   * Sync all historical blockchain events to database
   * Can be called manually via API endpoint
   * Processes events in chunks to avoid RPC rate limits
   */
  async syncAllEvents(fromBlock?: number, toBlock?: number): Promise<{ synced: number; errors: number }> {
    try {
      const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.VITE_SEPOLIA_RPC_URL;
      const contractAddress = process.env.CONTRACT_ADDRESS || process.env.VITE_CONTRACT_ADDRESS;
      
      if (!rpcUrl || !contractAddress) {
        throw new Error("Missing RPC_URL or CONTRACT_ADDRESS in environment");
      }
      
      // Initialize provider and contract if not already initialized
      if (!state.provider) {
        state.provider = new ethers.JsonRpcProvider(rpcUrl);
      }
      if (!state.contract) {
        state.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, state.provider);
      }
      
      const currentBlock = await state.provider.getBlockNumber();
      
      // Default: sync from contract creation block (or last 10,000 blocks if can't determine)
      // You can set CONTRACT_DEPLOYMENT_BLOCK env var to specify the exact block
      const contractDeploymentBlock = process.env.CONTRACT_DEPLOYMENT_BLOCK 
        ? parseInt(process.env.CONTRACT_DEPLOYMENT_BLOCK)
        : Math.max(0, currentBlock - 10000); // Default: last 10k blocks (~1.4 days)
      
      const startBlock = fromBlock ?? contractDeploymentBlock;
      const endBlock = toBlock ?? currentBlock;
      
      console.log(`🔄 Syncing events from block ${startBlock} to ${endBlock}`);
      
      // Process in chunks of 1000 blocks to avoid RPC limits
      const CHUNK_SIZE = 1000;
      let synced = 0;
      let errors = 0;
      
      for (let chunkStart = startBlock; chunkStart <= endBlock; chunkStart += CHUNK_SIZE) {
        const chunkEnd = Math.min(chunkStart + CHUNK_SIZE - 1, endBlock);
        
        try {
          console.log(`📦 Processing chunk: blocks ${chunkStart} to ${chunkEnd}`);
          
          const events = await state.contract!.queryFilter(
            state.contract!.filters.ExpenseAttested(),
            chunkStart,
            chunkEnd
          );
          
          console.log(`   Found ${events.length} events in this chunk`);
          
          for (const event of events) {
            try {
              if ('args' in event && event.args) {
                const { user, submissionHash, cid, timestamp, txMeta } = event.args as any;
                
                // Extract txHash and blockNumber from event if available
                const txHash = (event as ethers.Log).transactionHash || "pending";
                const blockNumber = (event as ethers.Log).blockNumber?.toString() || null;
                
                // Store with txHash and blockNumber
                await prisma.expense.upsert({
                  where: { cid },
                  create: {
                    userAddress: user.toLowerCase(),
                    cid,
                    submissionHash,
                    txHash,
                    blockNumber,
                    timestamp: new Date(Number(timestamp) * 1000),
                    status: "confirmed",
                  },
                  update: {
                    txHash,
                    blockNumber,
                    status: "confirmed",
                  },
                });
                
                synced++;
              }
            } catch (error: any) {
              console.error(`   Error processing event:`, error.message);
              errors++;
            }
          }
          
          // Small delay between chunks to avoid rate limiting
          if (chunkEnd < endBlock) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error: any) {
          console.error(`   Error processing chunk ${chunkStart}-${chunkEnd}:`, error.message);
          errors++;
        }
      }
      
      console.log(`✅ Sync complete: ${synced} events synced, ${errors} errors`);
      return { synced, errors };
    } catch (error: any) {
      console.error("❌ Failed to sync events:", error.message);
      throw error;
    }
  }
  
  /**
   * Stop listener
   */
  stop() {
    if (state.running && state.contract) {
      state.contract.removeAllListeners();
      state.running = false;
      console.log("🛑 Ethereum listener stopped");
    }
  }
}

export const ethListener = new EthListener();

