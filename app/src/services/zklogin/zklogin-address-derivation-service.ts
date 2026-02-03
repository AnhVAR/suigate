/**
 * Address derivation service for zkLogin
 * Derives Sui addresses and address seeds from JWT and salt
 * Uses dynamic imports to defer Sui SDK loading until after polyfills
 */

import { jwtDecode } from 'jwt-decode';
import type { DecodedJwt } from './zklogin-types';

// Lazy-loaded Sui SDK functions
let jwtToAddress: typeof import('@mysten/sui/zklogin').jwtToAddress;
let genAddressSeed: typeof import('@mysten/sui/zklogin').genAddressSeed;

/** Load Sui zklogin module dynamically */
const loadZkLoginModule = async () => {
  if (!jwtToAddress || !genAddressSeed) {
    const module = await import('@mysten/sui/zklogin');
    jwtToAddress = module.jwtToAddress;
    genAddressSeed = module.genAddressSeed;
  }
};

/**
 * Derive Sui address from JWT and salt
 * This is the deterministic address that the user will own
 * Using legacyAddress=false for new addresses (v2 SDK)
 */
export const deriveAddress = async (jwt: string, salt: string): Promise<string> => {
  await loadZkLoginModule();
  return jwtToAddress(jwt, salt, false);
};

/**
 * Compute address seed for zkLogin signature
 * The seed is derived from salt, sub claim, and aud claim
 */
export const computeAddressSeed = async (
  salt: string,
  sub: string,
  aud: string
): Promise<string> => {
  await loadZkLoginModule();
  return genAddressSeed(BigInt(salt), 'sub', sub, aud).toString();
};

/**
 * Extract JWT claims needed for address computation
 */
export const extractJwtClaims = (jwt: string): { sub: string; aud: string } => {
  const decoded = jwtDecode<DecodedJwt>(jwt);
  // aud can be string or array, return first if array
  const aud = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
  return { sub: decoded.sub, aud };
};

/**
 * Get full address derivation data from JWT and salt
 * Returns both the address and the seed needed for signatures
 */
export const getAddressData = async (
  jwt: string,
  salt: string
): Promise<{ suiAddress: string; addressSeed: string }> => {
  const suiAddress = await deriveAddress(jwt, salt);
  const { sub, aud } = extractJwtClaims(jwt);
  const addressSeed = await computeAddressSeed(salt, sub, aud);
  return { suiAddress, addressSeed };
};
