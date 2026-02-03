/**
 * Session cache service for zkLogin
 * Caches ZK proof and session data in SecureStore (per validation decision)
 */

import * as SecureStore from 'expo-secure-store';
import type { CachedProofData, ZkProofResponse } from './zklogin-types';

const PROOF_CACHE_KEY = 'zklogin_proof_cache';
const SUI_TESTNET_RPC_URL = 'https://fullnode.testnet.sui.io:443';

/** Direct RPC call to get current epoch */
const getCurrentEpoch = async (): Promise<number> => {
  const response = await fetch(SUI_TESTNET_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_getLatestSuiSystemState',
      params: [],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return Number(data.result.epoch);
};

/**
 * Cache proof data in SecureStore
 * Stores proof along with address and epoch info for session restore
 */
export const cacheProof = async (data: CachedProofData): Promise<void> => {
  await SecureStore.setItemAsync(PROOF_CACHE_KEY, JSON.stringify(data));
};

/**
 * Load cached proof from SecureStore
 */
export const loadCachedProof = async (): Promise<CachedProofData | null> => {
  const cached = await SecureStore.getItemAsync(PROOF_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
};

/**
 * Check if cached proof is still valid (epoch not expired)
 */
export const isProofValid = async (
  proof: CachedProofData
): Promise<boolean> => {
  const currentEpoch = await getCurrentEpoch();
  return currentEpoch < proof.maxEpoch;
};

/**
 * Clear proof cache (on logout or expiry)
 */
export const clearProofCache = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(PROOF_CACHE_KEY);
};

/**
 * Create cached proof data structure
 */
export const createCachedProofData = (
  proof: ZkProofResponse,
  addressSeed: string,
  maxEpoch: number,
  suiAddress: string
): CachedProofData => ({
  proof,
  addressSeed,
  maxEpoch,
  suiAddress,
  cachedAt: Date.now(),
});
