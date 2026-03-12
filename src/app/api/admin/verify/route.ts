// v2 - Complete rewrite
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  console.log("[VERIFY v2] Starting verification");
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json(
        { isValid: false, error: "JWT_SECRET not configured" },
        { status: 500 }
      );
    }

    // Get token from header or cookie
    const authHeader = request.headers.get("Authorization");
    let token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : null;
    
    if (!token) {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/admin_token=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      return NextResponse.json(
        { isValid: false, error: "No token" },
        { status: 401 }
      );
    }

    // Verify JWT - NO DATABASE
    const payload = jwt.verify(token, JWT_SECRET) as { adminId: string };

    console.log("[VERIFY v2] Token valid for:", payload.adminId);

    return NextResponse.json({
      isValid: true,
      adminId: payload.adminId,
    });
  } catch (error) {
    console.log("[VERIFY v2] Token invalid");
    return NextResponse.json(
      { isValid: false, error: "Invalid token" },
      { status: 401 }
    );
  }
}
