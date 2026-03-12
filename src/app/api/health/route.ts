import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  
  // Mask password for security
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
  
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlHasSsl: dbUrl.includes('sslmode='),
      databaseUrlPreview: maskedUrl.substring(0, 100) + (maskedUrl.length > 100 ? '...' : ''),
    }
  });
}
