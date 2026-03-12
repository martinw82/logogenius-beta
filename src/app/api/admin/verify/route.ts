import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log("[VERIFY v3] Starting...");
  
  try {
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

    // Decode simple token
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check expiration
      if (tokenData.exp && tokenData.exp < Date.now()) {
        return NextResponse.json(
          { isValid: false, error: "Token expired" },
          { status: 401 }
        );
      }

      console.log("[VERIFY v3] Token valid for:", tokenData.adminId);

      return NextResponse.json({
        isValid: true,
        adminId: tokenData.adminId,
      });
    } catch {
      return NextResponse.json(
        { isValid: false, error: "Invalid token format" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("[VERIFY v3] Error:", error);
    return NextResponse.json(
      { isValid: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
