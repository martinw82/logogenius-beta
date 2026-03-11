import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    }
  });
}
