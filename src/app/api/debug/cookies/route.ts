import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  
  return NextResponse.json({
    cookies: cookieHeader,
    userAgent: request.headers.get("user-agent"),
    timestamp: new Date().toISOString(),
  });
}
