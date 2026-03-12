let prismaClient: any = null;

export function getPrisma() {
  if (prismaClient) return prismaClient;

  try {
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = globalThis as any;

    // TiDB Cloud requires SSL
    const dbUrl = process.env.DATABASE_URL;
    const urlWithSsl = dbUrl?.includes('sslmode=') 
      ? dbUrl 
      : `${dbUrl}${dbUrl?.includes('?') ? '&' : '?'}sslmode=require`;

    prismaClient =
      globalForPrisma.prisma ||
      new PrismaClient({
        datasources: {
          db: {
            url: urlWithSsl,
          },
        },
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaClient;
    }

    return prismaClient;
  } catch (error) {
    console.error("Failed to initialize Prisma:", error);
    throw error;
  }
}

// Create a lazy accessor
export const prisma = getPrisma();
