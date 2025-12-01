/**
 * Prisma Client with connection pooling support
 * Handles "prepared statement already exists" errors (42P05) for connection pooling
 */

import { PrismaClient } from "@prisma/client";

// Fix DATABASE_URL for connection pooling (pgbouncer)
// Add ?pgbouncer=true if using pooler connection and it's not already there
let databaseUrl = process.env.DATABASE_URL || '';
if (databaseUrl.includes('pooler') || databaseUrl.includes(':6543')) {
  // Using pooler connection - add pgbouncer=true if not present
  if (!databaseUrl.includes('pgbouncer=true')) {
    const separator = databaseUrl.includes('?') ? '&' : '?';
    databaseUrl = `${databaseUrl}${separator}pgbouncer=true`;
    console.log('✅ [PRISMA] Added pgbouncer=true to connection string for connection pooling');
  }
}

// Create Prisma client with connection pooling configuration
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

/**
 * Execute a Prisma query with automatic retry on prepared statement errors
 * This handles the "prepared statement already exists" error (42P05) that occurs
 * with connection pooling (pgbouncer)
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a prepared statement error (42P05)
      // Check both the error object and the error message string
      const errorMessage = error?.message || String(error) || '';
      const errorCode = error?.code || '';
      
      const isPreparedStatementError = 
        errorCode === '42P05' || 
        errorMessage.includes('prepared statement') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('42P05');
      
      if (isPreparedStatementError && attempt < maxRetries) {
        console.warn(`⚠️ [PRISMA] Prepared statement error (attempt ${attempt + 1}/${maxRetries + 1}), retrying...`);
        console.warn(`⚠️ [PRISMA] Error details:`, { code: errorCode, message: errorMessage.substring(0, 200) });
        
        // For connection pooling, disconnect and reconnect to clear prepared statements
        try {
          await prisma.$disconnect();
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
        } catch (disconnectError) {
          // Ignore disconnect errors
        }
        continue;
      }
      
      // If not a prepared statement error or max retries reached, throw
      throw error;
    }
  }
  
  throw lastError;
}

export { prisma };
