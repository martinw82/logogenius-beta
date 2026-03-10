import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
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
}
