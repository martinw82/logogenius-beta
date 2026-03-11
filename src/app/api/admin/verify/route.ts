import { NextRequest, NextResponse } from "next/server";

export const handler = async (request: NextRequest) => {
  try {
    const { verifyAdminSession } = await import("@/lib/auth");

    // Debug: log cookies received
    const cookieHeader = request.headers.get("cookie");
    console.log("Verify - Cookies received:", cookieHeader);

    const session = await verifyAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { isValid: false, error: "Unauthorized", cookies: cookieHeader },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        isValid: true,
        adminId: session.adminId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { isValid: false, error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
};

export const GET = handler;
