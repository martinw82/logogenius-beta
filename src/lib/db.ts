let prismaClient: any = null;

export function getPrisma() {
  if (prismaClient) return prismaClient;

  try {
    const { PrismaClient } = require("@prisma/client");

    // TiDB Cloud requires SSL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL not set");
    }
    
    // Always add sslmode=require for TiDB Cloud
    const urlWithSsl = dbUrl.includes('sslmode=') 
      ? dbUrl 
      : `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}sslaccept=strict&sslmode=require`;

    console.log("Connecting to database with SSL...");
    
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: urlWithSsl,
        },
      },
      log: ['error'],
    });

    return prismaClient;
  } catch (error) {
    console.error("Failed to initialize Prisma:", error);
    throw error;
  }
}

// Create a lazy accessor
export const prisma = getPrisma();
