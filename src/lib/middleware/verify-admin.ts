import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";

/**
 * Middleware to verify admin authentication for protected API routes
 * Usage in API route:
 *
 * export async function GET(request: NextRequest) {
 *   const session = await verifyAdminMiddleware(request);
 *   if (!session) {
 *     return unauthorized();
 *   }
 *   // Route logic here
 * }
 */

export async function verifyAdminMiddleware(
  request: NextRequest
): Promise<{ adminId: string } | null> {
  const session = await verifyAdminSession(request);
  return session
    ? {
        adminId: session.adminId,
      }
    : null;
}

export function unauthorized() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

export function serverError(message: string = "Internal server error") {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}
