/**
 * OAuth flow service for zkLogin
 * Uses manual browser + deep link callback for nonce support
 */

import * as WebBrowser from 'expo-web-browser';
import { jwtDecode } from 'jwt-decode';
import { GOOGLE_OAUTH_CONFIG, GOOGLE_DISCOVERY } from '../../config/google-oauth-configuration';
import type { OAuthResult, DecodedJwt } from './zklogin-types';

// OAuth proxy URL
const OAUTH_PROXY_URL = 'https://oauth-proxy-one.vercel.app/callback';

// Store pending nonce for validation
let pendingNonce: string | null = null;

/**
 * Build Google OAuth URL with nonce
 */
const buildOAuthUrl = (nonce: string): string => {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.webClientId,
    redirect_uri: OAUTH_PROXY_URL,
    response_type: 'id_token',
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
    nonce,
  });
  return `${GOOGLE_DISCOVERY.authorizationEndpoint}?${params.toString()}`;
};

/**
 * Initiate Google OAuth - opens browser, returns pending
 * Call completeOAuthFlow when receiving callback
 */
export const initiateGoogleLogin = async (nonce: string): Promise<OAuthResult> => {
  try {
    console.log('[OAuth] Opening Google OAuth with nonce');
    pendingNonce = nonce;

    const authUrl = buildOAuthUrl(nonce);
    await WebBrowser.openBrowserAsync(authUrl);

    // Browser opened - will receive callback via deep link
    // Return pending status - actual result comes from completeOAuthFlow
    return { success: false, error: 'PENDING' };
  } catch (error: any) {
    console.error('[OAuth] Error:', error);
    pendingNonce = null;
    return { success: false, error: error.message || 'Failed to open browser' };
  }
};

/**
 * Complete OAuth flow with token from deep link callback
 */
export const completeOAuthFlow = (idToken: string): OAuthResult => {
  try {
    if (!idToken) {
      return { success: false, error: 'No ID token received' };
    }

    console.log('[OAuth] Completing flow with token');
    const decodedJwt = decodeAndValidateJwt(idToken, pendingNonce || '');
    pendingNonce = null;

    return { success: true, jwt: idToken, decodedJwt };
  } catch (error: any) {
    console.error('[OAuth] Complete error:', error);
    pendingNonce = null;
    return { success: false, error: error.message };
  }
};

/**
 * Decode JWT and validate critical claims
 * Validates issuer, nonce match, and expiration
 */
export const decodeAndValidateJwt = (
  jwt: string,
  expectedNonce: string
): DecodedJwt => {
  const decoded = jwtDecode<DecodedJwt>(jwt);

  // Validate issuer is Google
  if (decoded.iss !== 'https://accounts.google.com') {
    throw new Error('Invalid JWT issuer');
  }

  // Validate nonce matches our ephemeral key - prevents replay attacks
  if (decoded.nonce !== expectedNonce) {
    console.warn('[OAuth] Nonce mismatch:', {
      expected: expectedNonce,
      received: decoded.nonce,
    });
    throw new Error('Nonce mismatch - potential replay attack');
  }

  // Validate token hasn't expired
  if (decoded.exp * 1000 < Date.now()) {
    throw new Error('JWT expired');
  }

  return decoded;
};

/**
 * Extract sub (Google user ID) from JWT for salt derivation
 */
export const extractSubFromJwt = (jwt: string): string => {
  const decoded = jwtDecode<DecodedJwt>(jwt);
  return decoded.sub;
};

/**
 * Extract aud (client ID) from JWT for address computation
 */
export const extractAudFromJwt = (jwt: string): string => {
  const decoded = jwtDecode<DecodedJwt>(jwt);
  // aud can be string or array, return first if array
  return Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
};
