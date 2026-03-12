import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export interface JWTPayload {
  adminId: string;
  iat?: number;
  exp?: number;
}

export async function generateJWT(adminId: string): Promise<string> {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");
  
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: "24h" });
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    if (!JWT_SECRET) return null;
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [key, ...v] = c.split("=");
        return [key.trim(), decodeURIComponent(v.join("="))];
      })
    );
    if (cookies.admin_token) return cookies.admin_token;
  }

  return null;
}

export async function verifyAdminSession(request: Request): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyJWT(token);
}

// No-op functions for compatibility
export async function revokeJWT(): Promise<boolean> { return true; }
export async function verifyToken(token: string): Promise<JWTPayload | null> { return verifyJWT(token); }
