/**
 * Salt manager service for zkLogin
 * Retrieves salt from Mysten Labs salt service (or derives locally as fallback)
 * Salt ensures same user always gets same Sui address
 */

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SALT_STORAGE_KEY = 'zklogin_user_salt';
const MYSTEN_SALT_SERVICE_URL = 'https://salt.api.mystenlabs.com/get_salt';

// Use local salt derivation (Mysten service requires registered client ID)
const USE_LOCAL_SALT = true;

interface SaltServiceResponse {
  salt: string;
}

/**
 * Get salt for zkLogin
 * Uses local derivation for hackathon (Mysten service requires registered client)
 *
 * @param jwt - The JWT from Google OAuth
 * @param userId - User's sub claim for cache key
 */
export const getSalt = async (jwt: string, userId: string): Promise<string> => {
  // Clear old cached salt (salt format changed - now 16 bytes)
  // TODO: Remove this after all users have new salt
  await clearSalt(userId);

  let salt: string;

  if (USE_LOCAL_SALT) {
    // Derive salt locally (deterministic from userId)
    console.log('[Salt] Deriving salt locally...');
    salt = await deriveLocalSalt(userId);
  } else {
    // Fetch from Mysten salt service
    console.log('[Salt] Fetching from Mysten service...');
    salt = await fetchSaltFromMystenService(jwt);
  }

  console.log('[Salt] Derived salt (first 20 chars):', salt.substring(0, 20) + '...');

  // Cache for future use
  await cacheSalt(userId, salt);
  return salt;
};

/**
 * Derive salt locally using SHA256 hash of userId + app secret
 * zkLogin requires 16 bytes (128 bits) salt
 */
const deriveLocalSalt = async (userId: string): Promise<string> => {
  // Salt seed should be consistent per app deployment
  const saltSeed = `suigate-zklogin-salt-v1:${userId}`;
  const hashHex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    saltSeed
  );
  // Take first 32 hex chars (16 bytes = 128 bits) for zkLogin
  const salt16BytesHex = hashHex.substring(0, 32);
  const saltBigInt = BigInt('0x' + salt16BytesHex);
  return saltBigInt.toString();
};

/**
 * Fetch salt from Mysten Labs salt service
 * The service derives a deterministic salt from the JWT
 */
const fetchSaltFromMystenService = async (jwt: string): Promise<string> => {
  const response = await fetch(MYSTEN_SALT_SERVICE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: jwt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Salt service error: ${response.status} - ${errorText}`);
  }

  const data: SaltServiceResponse = await response.json();

  if (!data.salt) {
    throw new Error('Salt service returned empty salt');
  }

  return data.salt;
};

/**
 * Cache salt in SecureStore (encrypted)
 */
export const cacheSalt = async (userId: string, salt: string): Promise<void> => {
  await SecureStore.setItemAsync(`${SALT_STORAGE_KEY}_${userId}`, salt);
};

/**
 * Load cached salt from SecureStore
 */
export const loadCachedSalt = async (
  userId: string
): Promise<string | null> => {
  return SecureStore.getItemAsync(`${SALT_STORAGE_KEY}_${userId}`);
};

/**
 * Clear cached salt (on logout)
 */
export const clearSalt = async (userId: string): Promise<void> => {
  await SecureStore.deleteItemAsync(`${SALT_STORAGE_KEY}_${userId}`);
};
