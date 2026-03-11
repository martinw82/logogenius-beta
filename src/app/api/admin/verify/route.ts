import { NextRequest, NextResponse } from "next/server";

export const handler = async (request: NextRequest) => {
  try {
    const { verifyAdminSession } = await import("@/lib/auth");

    const session = await verifyAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { isValid: false, error: "Unauthorized" },
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
    return NextResponse.json(
      { isValid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const GET = handler;
