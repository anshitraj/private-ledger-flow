// Vercel Serverless Function Entry Point
import { app } from "../src/app";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Vercel serverless function handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}

