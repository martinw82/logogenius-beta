import { NextRequest, NextResponse } from "next/server";
import { revokeJWT, getTokenFromRequest } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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
}
