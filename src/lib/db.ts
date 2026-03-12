let prismaClient: any = null;

export function getPrisma() {
  if (prismaClient) return prismaClient;

  try {
    const { PrismaClient } = require("@prisma/client");

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL not set");
    }
    
    // TiDB Cloud requires SSL with specific parameters
    // Format: mysql://user:pass@host:port/db?sslaccept=strict
    let urlWithSsl = dbUrl;
    
    // Parse the URL and add SSL parameters
    try {
      const url = new URL(dbUrl);
      
      // Add SSL parameters for TiDB Cloud
      if (!url.searchParams.has('sslaccept')) {
        url.searchParams.set('sslaccept', 'strict');
      }
      if (!url.searchParams.has('sslmode')) {
        url.searchParams.set('sslmode', 'REQUIRED');
      }
      
      urlWithSsl = url.toString();
      console.log("Database URL configured with SSL");
    } catch (e) {
      console.error("Failed to parse DATABASE_URL:", e);
      // Fallback: append SSL params manually
      const separator = dbUrl.includes('?') ? '&' : '?';
      urlWithSsl = `${dbUrl}${separator}sslaccept=strict&sslmode=REQUIRED`;
    }

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
