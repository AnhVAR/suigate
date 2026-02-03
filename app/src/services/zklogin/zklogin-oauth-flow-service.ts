/**
 * OAuth flow service for zkLogin
 * Uses native Google Sign-In SDK for better Android/iOS compatibility
 */

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { jwtDecode } from 'jwt-decode';
import { GOOGLE_OAUTH_CONFIG } from '../../config/google-oauth-configuration';
import type { OAuthResult, DecodedJwt } from './zklogin-types';

let isConfigured = false;

/**
 * Configure Google Sign-In SDK
 * Must be called before initiating login
 */
const configureGoogleSignIn = (nonce: string) => {
  GoogleSignin.configure({
    // Web client ID is used as serverClientId to get id_token
    webClientId: GOOGLE_OAUTH_CONFIG.webClientId,
    offlineAccess: false,
    // Pass nonce for zkLogin - ties JWT to ephemeral keypair
    nonce,
  });
  isConfigured = true;
};

/**
 * Initiate Google OAuth flow with zkLogin nonce
 * Uses native Google Sign-In SDK which properly handles Android OAuth
 */
export const initiateGoogleLogin = async (nonce: string): Promise<OAuthResult> => {
  try {
    // Configure with the nonce
    configureGoogleSignIn(nonce);

    // Check if already signed in
    const isSignedIn = await GoogleSignin.hasPreviousSignIn();
    if (isSignedIn) {
      // Sign out first to ensure fresh login with new nonce
      await GoogleSignin.signOut();
    }

    console.log('[OAuth] Initiating native Google Sign-In with nonce');

    // Sign in and get tokens
    const userInfo = await GoogleSignin.signIn();

    // Get the id_token from the sign-in response
    const tokens = await GoogleSignin.getTokens();
    const jwt = tokens.idToken;

    if (!jwt) {
      return {
        success: false,
        error: 'No ID token received from Google Sign-In',
      };
    }

    console.log('[OAuth] Received ID token, validating...');

    // Decode and validate JWT
    const decodedJwt = decodeAndValidateJwt(jwt, nonce);

    return { success: true, jwt, decodedJwt };
  } catch (error: any) {
    console.error('[OAuth] Error:', error);

    // Handle specific Google Sign-In errors
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, error: 'User cancelled login' };
    }
    if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, error: 'Sign in already in progress' };
    }
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, error: 'Google Play Services not available' };
    }

    return {
      success: false,
      error: error.message || 'Google Sign-In failed',
    };
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
