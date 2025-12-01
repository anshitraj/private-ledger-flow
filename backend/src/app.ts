import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { recordsRouter } from "./routes/records";
import { ipfsRouter } from "./routes/ipfs";
import { coprocRouter } from "./routes/coproc";
import { migrateRouter } from "./routes/migrate";
import { ethListener } from "./services/ethListener";

export const app = express();

// Trust proxy (required for Vercel and other platforms behind proxies)
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:8080", 
    "http://localhost:8081", 
    "http://localhost:3000",
    /^http:\/\/localhost:\d+$/, // Allow any localhost port
    /^https:\/\/.*\.vercel\.app$/, // Allow Vercel deployments
    /^https:\/\/.*\.railway\.app$/, // Allow Railway deployments
    /^https:\/\/.*\.onrender\.com$/, // Allow Render deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-Requested-With',
  ],
  exposedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Root path handler
app.get("/", (req, res) => {
  res.json({
    message: "Private Expense Tracker Backend API",
    status: "ok",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      records: "/api/records",
      sync: "POST /api/records/sync - Sync blockchain events to database",
      migrate: "POST /api/migrate - Run database migrations",
      ipfs: "/api/ipfs",
      coproc: "/api/coproc"
    }
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Initialize Ethereum listener (only in non-serverless environments)
// In serverless, we skip the persistent listener
if (process.env.VERCEL !== "1" && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    ethListener.start().catch((err) => {
      console.warn("⚠️ Ethereum listener failed to start (non-critical):", err.message);
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.warn("⚠️ Ethereum listener initialization skipped:", error.message);
  }
}

// API routes
app.use("/api/records", recordsRouter);
app.use("/api/ipfs", ipfsRouter);
app.use("/api/coproc", coprocRouter);
app.use("/api/migrate", migrateRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

