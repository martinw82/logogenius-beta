import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, getTokenFromRequest } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = getTokenFromRequest(request);

    if (!token) {
      // Redirect to login page
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Verify token is valid
    const session = await verifyJWT(token);
    if (!session) {
      // Token invalid or expired, redirect to login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin")) {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
