import { NextRequest, NextResponse } from "next/server";
import { generateJWT } from "@/lib/auth";
import { verifyAdminPassword } from "@/lib/hash";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // For MVP, we use a single admin account with credentials from env
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify credentials
    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordValid = await verifyAdminPassword(password, ADMIN_PASSWORD);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await generateJWT(ADMIN_USERNAME);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create response with token in cookie
    const response = NextResponse.json(
      {
        success: true,
        token,
        adminId: ADMIN_USERNAME,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 }
    );

    // Set cookie with token
    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
