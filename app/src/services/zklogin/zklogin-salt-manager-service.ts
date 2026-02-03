/**
 * Salt manager service for zkLogin
 * Retrieves salt from Mysten Labs salt service and caches locally
 * Salt ensures same user always gets same Sui address
 */

import * as SecureStore from 'expo-secure-store';

const SALT_STORAGE_KEY = 'zklogin_user_salt';
const MYSTEN_SALT_SERVICE_URL = 'https://salt.api.mystenlabs.com/get_salt';

interface SaltServiceResponse {
  salt: string;
}

/**
 * Get salt for zkLogin from Mysten Labs salt service
 * Caches result in SecureStore for performance
 *
 * @param jwt - The JWT from Google OAuth
 * @param userId - User's sub claim for cache key
 */
export const getSalt = async (jwt: string, userId: string): Promise<string> => {
  // Try cache first
  const cached = await loadCachedSalt(userId);
  if (cached) {
    return cached;
  }

  // Fetch from Mysten salt service
  const salt = await fetchSaltFromMystenService(jwt);

  // Cache for future use
  await cacheSalt(userId, salt);
  return salt;
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
