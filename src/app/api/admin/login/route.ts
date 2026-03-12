import { NextRequest, NextResponse } from "next/server";

// Inline JWT implementation - NO external imports
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function signJWT(payload: object, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  }));
  
  // In production, use proper HMAC - this is simplified
  const signature = base64UrlEncode(`${encodedHeader}.${encodedPayload}.${secret}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log("[LOGIN v3] Starting...");
  
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
      console.error("[LOGIN v3] ADMIN_PASSWORD not set");
      return NextResponse.json(
        { error: "Server config error" },
        { status: 500 }
      );
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create simple token (base64 encoded JSON)
    const tokenData = {
      adminId: ADMIN_USERNAME,
      exp: Date.now() + (24 * 60 * 60 * 1000)
    };
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    console.log("[LOGIN v3] Success, token created");

    const response = NextResponse.json(
      { success: true, token, adminId: ADMIN_USERNAME },
      { status: 200 }
    );

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN v3] Error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
