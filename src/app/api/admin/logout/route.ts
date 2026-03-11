import { NextRequest, NextResponse } from "next/server";

export const handler = async (request: NextRequest) => {
  try {
    const { revokeJWT, getTokenFromRequest } = await import("@/lib/auth");

    const token = getTokenFromRequest(request);

    if (token) {
      // Revoke the token
      await revokeJWT(token);
    }

    // Create response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the token cookie
    response.cookies.set({
      name: "admin_token",
      value: "",
      httpOnly: true,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = handler;
