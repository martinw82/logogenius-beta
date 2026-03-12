import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const handler = async (request: NextRequest) => {
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

    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token (no database)
    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: "JWT_SECRET not configured" },
        { status: 500 }
      );
    }

    const token = jwt.sign({ 
      adminId: ADMIN_USERNAME,
      iat: Math.floor(Date.now() / 1000)
    }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const response = NextResponse.json(
      {
        success: true,
        token,
        adminId: ADMIN_USERNAME,
      },
      { status: 200 }
    );

    // Set cookie
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = handler;
