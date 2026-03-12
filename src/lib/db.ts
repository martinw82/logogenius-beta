// Database connection with TiDB Cloud SSL support
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not defined");
  }

  // For TiDB Cloud, ensure SSL is enabled
  // The URL should already have sslmode=require from env var
  // But if not, we need to add it
  let url = databaseUrl;
  
  // Parse and rebuild URL with SSL params if missing
  if (!url.includes('sslmode=')) {
    const hasQuery = url.includes('?');
    url = `${url}${hasQuery ? '&' : '?'}sslmode=require`;
  }

  console.log("[DB] Creating Prisma client with SSL");

  return new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
    log: ['error', 'warn'],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Lazy getter for compatibility
export function getPrisma() {
  return prisma;
}
