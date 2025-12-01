import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";

const router = Router();
const execAsync = promisify(exec);

/**
 * POST /api/migrate
 * Run Prisma migrations on the production database
 * ⚠️ This should be protected in production with authentication!
 * For now, it's accessible to allow initial setup
 */
router.post("/", async (req, res) => {
  try {
    console.log("🔄 Starting Prisma migration...");
    
    // Run Prisma migrate deploy (for production)
    // This applies pending migrations without creating new ones
    const { stdout, stderr } = await execAsync("npx prisma migrate deploy", {
      cwd: process.cwd(),
      env: process.env,
      timeout: 60000, // 60 second timeout
    });
    
    console.log("✅ Migration output:", stdout);
    if (stderr) {
      console.warn("⚠️ Migration warnings:", stderr);
    }
    
    res.json({
      success: true,
      message: "Migrations applied successfully",
      output: stdout,
      warnings: stderr || null,
    });
  } catch (error: any) {
    console.error("❌ Migration error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stdout: error.stdout || null,
      stderr: error.stderr || null,
    });
  }
});

/**
 * GET /api/migrate/status
 * Check migration status
 */
router.get("/status", async (req, res) => {
  try {
    // Check if migrations are in sync
    const { stdout, stderr } = await execAsync("npx prisma migrate status", {
      cwd: process.cwd(),
      env: process.env,
      timeout: 30000,
    });
    
    res.json({
      success: true,
      status: stdout,
      warnings: stderr || null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stdout: error.stdout || null,
      stderr: error.stderr || null,
    });
  }
});

export { router as migrateRouter };

