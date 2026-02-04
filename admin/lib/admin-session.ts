import Cookies from 'js-cookie';

const ADMIN_SESSION_COOKIE = 'admin_session';

export interface AdminTokenPayload {
  sub: string; // userId
  sui_address: string;
  role: 'admin' | 'support';
  iat: number;
  exp: number;
}

/**
 * Set admin session token in cookie
 * @param token - Admin JWT token
 */
export function setAdminSession(token: string): void {
  // Set cookie with 24h expiry, secure in production
  Cookies.set(ADMIN_SESSION_COOKIE, token, {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

/**
 * Get admin session token from cookie
 * @returns Token string or null if not found
 */
export function getAdminSession(): string | null {
  return Cookies.get(ADMIN_SESSION_COOKIE) || null;
}

/**
 * Clear admin session (logout)
 */
export function clearAdminSession(): void {
  Cookies.remove(ADMIN_SESSION_COOKIE);
}

/**
 * Decode admin JWT token (without verification - for client-side reading only)
 * @param token - JWT token
 * @returns Decoded payload or null if invalid
 */
export function decodeAdminToken(token: string): AdminTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if current session is valid
 * @returns True if session exists and is not expired
 */
export function isSessionValid(): boolean {
  const token = getAdminSession();
  if (!token) return false;

  const payload = decodeAdminToken(token);
  return payload !== null;
}
