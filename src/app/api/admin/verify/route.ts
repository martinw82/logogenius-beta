import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function GET(request: NextRequest) {
  try {
    // Get token from header or cookie
    const authHeader = request.headers.get("Authorization");
    let token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : null;
    
    // If no token in header, check cookie
    if (!token) {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split("; ").map((c) => {
            const [key, ...v] = c.split("=");
            return [key.trim(), decodeURIComponent(v.join("="))];
          })
        );
        token = cookies.admin_token || null;
      }
    }

    if (!token) {
      return NextResponse.json(
        { isValid: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // Verify JWT
    const payload = jwt.verify(token, JWT_SECRET) as { adminId: string };

    return NextResponse.json({
      isValid: true,
      adminId: payload.adminId,
    });
  } catch (error) {
    return NextResponse.json(
      { isValid: false, error: "Invalid token" },
      { status: 401 }
    );
  }
}
