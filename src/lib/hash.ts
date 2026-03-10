import bcryptjs from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Simple password verification for MVP - compares against plain text env variable
 * Replace with proper hashing in production
 */
export async function verifyAdminPassword(
  password: string,
  expectedPassword: string
): Promise<boolean> {
  // For MVP, we compare directly against env var (no hashing)
  // In production, store hashed version in database
  return password === expectedPassword;
}
