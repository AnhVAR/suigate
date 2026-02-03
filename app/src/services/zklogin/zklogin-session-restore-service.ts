/**
 * Session restore service for zkLogin
 * Restores zkLogin session on app restart without re-authentication
 */

import {
  loadEphemeralKey,
  isKeyExpired,
  clearEphemeralKey,
} from './zklogin-ephemeral-keypair-service';
import {
  loadCachedProof,
  isProofValid,
  clearProofCache,
} from './zklogin-session-cache-service';
import { loadCachedSalt, clearSalt } from './zklogin-salt-manager-service';
import type { SessionRestoreResult, ZkLoginData } from './zklogin-types';

/**
 * Attempt to restore zkLogin session from stored data
 * Returns restored zkLoginData if valid, or indicates re-auth needed
 *
 * @param userId - User's sub claim for cache keys
 */
export const restoreSession = async (
  userId: string
): Promise<SessionRestoreResult> => {
  try {
    // 1. Load ephemeral key
    const ephemeralKey = await loadEphemeralKey();
    if (!ephemeralKey) {
      return { restored: false, requiresReAuth: true, reason: 'missing' };
    }

    // 2. Check if ephemeral key expired
    if (await isKeyExpired(ephemeralKey)) {
      await clearExpiredSession(userId);
      return { restored: false, requiresReAuth: true, reason: 'expired' };
    }

    // 3. Load cached proof
    const cachedProof = await loadCachedProof();
    if (!cachedProof) {
      // Key valid but no proof - need to re-auth to get new proof
      return { restored: false, requiresReAuth: true, reason: 'missing' };
    }

    // 4. Check if proof is still valid
    if (!(await isProofValid(cachedProof))) {
      await clearExpiredSession(userId);
      return { restored: false, requiresReAuth: true, reason: 'expired' };
    }

    // 5. Load salt
    const salt = await loadCachedSalt(userId);
    if (!salt) {
      return { restored: false, requiresReAuth: true, reason: 'missing' };
    }

    // 6. Construct zkLoginData from cached components
    const zkLoginData: ZkLoginData = {
      ephemeralKey,
      proof: cachedProof.proof,
      addressSeed: cachedProof.addressSeed,
      suiAddress: cachedProof.suiAddress,
      maxEpoch: ephemeralKey.maxEpoch,
    };

    return {
      restored: true,
      requiresReAuth: false,
      zkLoginData,
    };
  } catch (error) {
    console.error('Session restore error:', error);
    return { restored: false, requiresReAuth: true, reason: 'invalid' };
  }
};

/**
 * Clear expired session data
 */
export const clearExpiredSession = async (userId: string): Promise<void> => {
  await clearEphemeralKey();
  await clearProofCache();
  // Keep salt - it's deterministic and doesn't expire
  // Salt only cleared on full logout
};

/**
 * Clear all zkLogin data (on logout)
 */
export const clearAllZkLoginData = async (userId: string): Promise<void> => {
  await clearEphemeralKey();
  await clearProofCache();
  await clearSalt(userId);
};
