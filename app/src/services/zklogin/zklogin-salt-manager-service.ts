/**
 * Salt manager service for zkLogin
 * Retrieves salt from Enoki (Mysten's hosted zkLogin service)
 * Salt ensures same user always gets same Sui address
 */

import * as SecureStore from 'expo-secure-store';
import {
  ENOKI_BASE_URL,
  getEnokiHeaders,
} from '../../config/api-base-configuration';

const SALT_STORAGE_KEY = 'zklogin_user_salt';

interface EnokiSaltResponse {
  address: string;
  salt: string;
}

/**
 * Get salt for zkLogin from Enoki
 *
 * @param jwt - The JWT from Google OAuth
 * @param userId - User's sub claim for cache key
 */
export const getSalt = async (jwt: string, userId: string, forceRefresh = false): Promise<string> => {
  // Check cached salt first (deterministic per user)
  if (!forceRefresh) {
    const cached = await loadCachedSalt(userId);
    if (cached) {
      console.log('[Salt] Using cached salt');
      return cached;
    }
  } else {
    console.log('[Salt] Force refresh - clearing cached salt');
    await clearSalt(userId);
  }

  // Fetch from Enoki
  console.log('[Salt] Fetching from Enoki...');
  const salt = await fetchSaltFromEnoki(jwt);

  console.log('[Salt] Got salt (first 20 chars):', salt.substring(0, 20) + '...');

  // Cache for future use
  await cacheSalt(userId, salt);
  return salt;
};

/**
 * Fetch salt from Enoki service
 * Enoki derives a deterministic salt from the JWT
 */
const fetchSaltFromEnoki = async (jwt: string): Promise<string> => {
  const response = await fetch(`${ENOKI_BASE_URL}/zklogin`, {
    method: 'GET',
    headers: getEnokiHeaders(jwt),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Enoki salt error: ${response.status} - ${errorText}`);
  }

  const response_data = await response.json();
  console.log('[Salt] Enoki response:', JSON.stringify(response_data));

  // Enoki wraps response in "data" object
  const data = response_data.data || response_data;
  const salt = data.salt;
  if (!salt) {
    throw new Error(`Enoki returned empty salt. Response: ${JSON.stringify(response_data)}`);
  }

  console.log('[Salt] Enoki address:', data.address);
  return salt;
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
