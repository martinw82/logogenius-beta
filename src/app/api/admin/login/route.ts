import { NextRequest, NextResponse } from "next/server";

export const handler = async (request: NextRequest) => {
  try {
    const { generateJWT } = await import("@/lib/auth");
    const { verifyAdminPassword } = await import("@/lib/hash");

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
      secure: true, // Always secure for HTTPS (Vercel)
      sameSite: "none", // Required for cross-site cookies
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/", // Available for all paths
    });

    console.log("Login - Cookie set for admin:", ADMIN_USERNAME);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
};

export const POST = handler;
