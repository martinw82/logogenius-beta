import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/database-check";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  
  // Mask password for security
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
  
  // Check actual database connectivity
  const dbHealth = await checkDatabaseHealth();
  
  return NextResponse.json({
    status: dbHealth.status === 'ok' ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    database: {
      status: dbHealth.status,
      message: dbHealth.message,
      details: dbHealth.details,
    },
    env: {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlHasSsl: dbUrl.includes('sslmode='),
      databaseUrlPreview: maskedUrl.substring(0, 100) + (maskedUrl.length > 100 ? '...' : ''),
    }
  });
}
