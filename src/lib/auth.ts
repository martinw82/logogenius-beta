import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRATION = "24h";

export interface JWTPayload {
  adminId: string;
  iat?: number;
  exp?: number;
}

// Lazy load Prisma to avoid build-time module issues
function getPrisma() {
  const { getPrisma: getPrismaClient } = require("./db");
  return getPrismaClient();
}

export async function generateJWT(adminId: string): Promise<string> {
  if (!JWT_SECRET || JWT_SECRET === "") {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ adminId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

  // Store session in database for tracking/revocation
  try {
    const prisma = getPrisma();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.adminSession.create({
      data: {
        adminId,
        token,
        expiresAt,
      },
    });
  } catch (dbError) {
    // Log but don't fail - token is still valid
    console.error("Failed to store session in database:", dbError);
  }

  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const prisma = getPrisma();

    // Check if session still exists in database
    const session = await prisma.adminSession.findUnique({
      where: { token },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export async function revokeJWT(token: string): Promise<boolean> {
  try {
    const prisma = getPrisma();
    const result = await prisma.adminSession.delete({
      where: { token },
    });
    return !!result;
  } catch (error) {
    return false;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [key, ...v] = c.split("=");
        return [key, decodeURIComponent(v.join("="))];
      })
    );
    if (cookies.admin_token) {
      return cookies.admin_token;
    }
  }

  return null;
}

export async function verifyAdminSession(
  request: Request
): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request);
  console.log("verifyAdminSession - token found:", !!token);
  if (!token) return null;
  return verifyJWT(token);
}

// For client-side verification (fallback when cookies don't work)
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  return verifyJWT(token);
}
