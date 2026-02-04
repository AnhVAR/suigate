import { apiClient } from './api-client';

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export interface AdminSession {
  userId: string;
  suiAddress: string;
  role: 'admin' | 'support';
  token: string;
}

/**
 * Build Google OAuth URL for zkLogin flow
 * @param redirectUri - The redirect URI after OAuth (e.g., http://localhost:3000/login)
 * @returns OAuth URL to redirect user to
 */
export function buildGoogleOAuthUrl(redirectUri: string): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: generateNonce(),
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

/**
 * Parse OAuth callback from URL hash
 * @param hash - The URL hash from OAuth redirect (window.location.hash)
 * @returns Parsed id_token or null if not found
 */
export function parseOAuthCallback(hash: string): { idToken: string } | null {
  if (!hash || !hash.startsWith('#')) {
    return null;
  }

  const params = new URLSearchParams(hash.substring(1));
  const idToken = params.get('id_token');

  if (!idToken) {
    return null;
  }

  return { idToken };
}

/**
 * Authenticate admin user with backend using Google id_token
 * @param idToken - Google OAuth id_token
 * @returns Admin session data
 */
export async function authenticateAdmin(idToken: string): Promise<AdminSession> {
  try {
    const response = await apiClient.post<AdminSession>('/admin/auth/zklogin', {
      idToken,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Admin authentication failed: ${error.message}`);
    }
    throw new Error('Admin authentication failed');
  }
}

/**
 * Generate random nonce for OAuth
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
