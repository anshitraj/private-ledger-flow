import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ethListener } from "../services/ethListener";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/records
 * Query parameters: limit, category, userAddress
 */
router.get("/", async (req, res) => {
  try {
    // Disable caching to ensure fresh data
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'ETag': `"${Date.now()}"`, // Unique ETag to prevent 304 responses
    });
    
    const { limit = "50", category, userAddress } = req.query;
    
    const where: any = {};
    if (category) where.category = category as string;
    if (userAddress) where.userAddress = (userAddress as string).toLowerCase();
    
    const records = await prisma.expense.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: parseInt(limit as string),
    });
    
    res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error: any) {
    console.error("Error fetching records:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/records/:cid
 */
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    
    const record = await prisma.expense.findUnique({
      where: { cid },
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }
    
    res.json({
      success: true,
      record,
    });
  } catch (error: any) {
    console.error("Error fetching record:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/proof/:cid
 * Returns proof details including event metadata
 */
router.get("/proof/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    
    const record = await prisma.expense.findUnique({
      where: { cid },
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Proof not found",
      });
    }
    
    // Return metadata only - NOT decrypted amounts
    res.json({
      success: true,
      proof: {
        cid: record.cid,
        submissionHash: record.submissionHash,
        txHash: record.txHash,
        blockNumber: record.blockNumber,
        timestamp: record.timestamp,
        userAddress: record.userAddress,
        category: record.category,
      },
      // Do not return decrypted data
      encrypted: true,
    });
  } catch (error: any) {
    console.error("Error fetching proof:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/records
 * Create a new expense record in the database
 * Called by frontend after successful blockchain transaction
 */
router.post("/", async (req, res) => {
  try {
    const { userAddress, cid, submissionHash, txHash, blockNumber, category, note, timestamp } = req.body;
    
    // Validate required fields
    if (!userAddress || !cid || !submissionHash || !txHash) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userAddress, cid, submissionHash, txHash",
      });
    }
    
    console.log(`💾 Saving expense record: ${cid} from ${userAddress}`);
    
    // Upsert record (create or update if exists)
    const record = await prisma.expense.upsert({
      where: { cid },
      create: {
        userAddress: userAddress.toLowerCase(),
        cid,
        submissionHash,
        txHash,
        blockNumber: blockNumber || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        category: category || null,
        note: note || null,
        status: "confirmed",
      },
      update: {
        txHash,
        blockNumber: blockNumber || null,
        status: "confirmed",
      },
    });
    
    console.log(`✅ Expense record saved: ${cid}`);
    
    res.json({
      success: true,
      record,
    });
  } catch (error: any) {
    console.error("Error saving record:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/records/sync
 * Manually sync blockchain events to database
 * Query params: fromBlock (optional), toBlock (optional)
 * This is useful when the persistent listener isn't running (e.g., in serverless environments)
 */
router.post("/sync", async (req, res) => {
  try {
    const { fromBlock, toBlock } = req.query;
    
    const fromBlockNum = fromBlock ? parseInt(fromBlock as string) : undefined;
    const toBlockNum = toBlock ? parseInt(toBlock as string) : undefined;
    
    console.log(`🔄 Manual sync requested: fromBlock=${fromBlockNum ?? 'auto'}, toBlock=${toBlockNum ?? 'latest'}`);
    
    const result = await ethListener.syncAllEvents(fromBlockNum, toBlockNum);
    
    res.json({
      success: true,
      message: `Sync completed: ${result.synced} events synced, ${result.errors} errors`,
      synced: result.synced,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error("Error syncing events:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export { router as recordsRouter };

