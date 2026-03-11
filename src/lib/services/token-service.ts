import crypto from 'crypto';

/**
 * Token Service
 * Generates and validates secure tokens for customer dashboard access
 * Tokens expire after 1 year (customizable)
 */

export interface DashboardToken {
  token: string;
  orderId: number;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

const TOKEN_LENGTH = 32; // bytes
const TOKEN_EXPIRY_DAYS = 365; // 1 year

/**
 * Generate a cryptographically secure token for dashboard access
 * @param orderId - The order ID associated with this token
 * @returns Token string (64 hex characters)
 */
export function generateDashboardToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Calculate token expiration date
 * @param days - Number of days until expiration (default: 365)
 * @returns Expiration date
 */
export function getTokenExpirationDate(days: number = TOKEN_EXPIRY_DAYS): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

/**
 * Validate if a token is still valid (not expired)
 * @param expiresAt - Token expiration date
 * @returns true if token is still valid, false if expired
 */
export function isTokenValid(expiresAt: Date): boolean {
  return new Date() < expiresAt;
}

/**
 * Hash a token for secure storage
 * In practice, this would use bcrypt, but for MVP we can use SHA-256
 * @param token - Plain text token
 * @returns Hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token against its hash
 * @param token - Plain text token to verify
 * @param hash - Hash to compare against
 * @returns true if token matches hash
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return tokenHash === hash;
}

/**
 * Generate complete dashboard token data for database storage
 * @param orderId - Order ID this token grants access to
 * @returns Token data ready for database insertion
 */
export function createTokenData(orderId: number) {
  const token = generateDashboardToken();
  const now = new Date();
  const expiresAt = getTokenExpirationDate();

  return {
    token, // Return plain token for customer
    tokenHash: hashToken(token), // Store hashed version in database
    orderId,
    createdAt: now,
    expiresAt,
    isValid: true,
  };
}
