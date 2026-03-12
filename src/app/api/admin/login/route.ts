import { NextRequest, NextResponse } from "next/server";
import { generateJWT } from "@/lib/auth";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

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

    // Create proper JWT token
    const token = await generateJWT(ADMIN_USERNAME);

    console.log("[LOGIN v3] Success, JWT token created");

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
