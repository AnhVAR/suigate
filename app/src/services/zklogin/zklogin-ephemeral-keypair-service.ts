/**
 * Ephemeral keypair service for zkLogin
 * Generates, stores, and manages Ed25519 ephemeral keys used in zkLogin flow
 * Uses dynamic imports to defer Sui SDK loading until after polyfills are set up
 */

import * as SecureStore from 'expo-secure-store';
import type { EphemeralKeyData } from './zklogin-types';

const EPHEMERAL_KEY_STORAGE_KEY = 'zklogin_ephemeral_key';
const SUI_TESTNET_RPC_URL = 'https://fullnode.testnet.sui.io:443';

// Lazy-loaded Sui SDK modules (loaded only when needed to ensure polyfills run first)
let Ed25519Keypair: typeof import('@mysten/sui/keypairs/ed25519').Ed25519Keypair;
let generateNonce: typeof import('@mysten/sui/zklogin').generateNonce;
let generateRandomness: typeof import('@mysten/sui/zklogin').generateRandomness;

/** Load Sui SDK modules dynamically (ensures polyfills are available) */
const loadSuiSdk = async () => {
  if (!Ed25519Keypair) {
    const keypairModule = await import('@mysten/sui/keypairs/ed25519');
    Ed25519Keypair = keypairModule.Ed25519Keypair;
  }
  if (!generateNonce || !generateRandomness) {
    const zkloginModule = await import('@mysten/sui/zklogin');
    generateNonce = zkloginModule.generateNonce;
    generateRandomness = zkloginModule.generateRandomness;
  }
};

/** Direct RPC call to get latest Sui system state (avoids SuiClient import issues) */
const getLatestSuiSystemState = async (): Promise<{ epoch: string }> => {
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
  return { epoch: data.result.epoch };
};

/**
 * Generate a new ephemeral keypair with nonce for zkLogin
 * Fetches current epoch from Sui network to calculate maxEpoch
 */
export const generateEphemeralKeypair = async (): Promise<EphemeralKeyData> => {
  await loadSuiSdk();
  const { epoch } = await getLatestSuiSystemState();

  // Keypair valid for ~10 days (2 epochs)
  const maxEpoch = Number(epoch) + 2;

  const keypair = new Ed25519Keypair();
  const randomness = generateRandomness();
  const nonce = generateNonce(keypair.getPublicKey(), maxEpoch, randomness);

  return {
    secretKey: keypair.getSecretKey(),
    publicKey: keypair.getPublicKey().toBase64(),
    randomness: randomness.toString(),
    nonce,
    maxEpoch,
    createdAt: Date.now(),
  };
};

/**
 * Store ephemeral key data in SecureStore (encrypted)
 */
export const storeEphemeralKey = async (data: EphemeralKeyData): Promise<void> => {
  await SecureStore.setItemAsync(EPHEMERAL_KEY_STORAGE_KEY, JSON.stringify(data));
};

/**
 * Load ephemeral key data from SecureStore
 */
export const loadEphemeralKey = async (): Promise<EphemeralKeyData | null> => {
  const stored = await SecureStore.getItemAsync(EPHEMERAL_KEY_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

/**
 * Clear ephemeral key from SecureStore (on logout or expiry)
 */
export const clearEphemeralKey = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(EPHEMERAL_KEY_STORAGE_KEY);
};

/**
 * Check if ephemeral key has expired by comparing current epoch
 */
export const isKeyExpired = async (data: EphemeralKeyData): Promise<boolean> => {
  const { epoch } = await getLatestSuiSystemState();
  return Number(epoch) >= data.maxEpoch;
};

/**
 * Get existing valid ephemeral key or create new one
 * Main entry point for obtaining ephemeral key
 */
export const getOrCreateEphemeralKey = async (): Promise<EphemeralKeyData> => {
  const stored = await loadEphemeralKey();

  if (stored && !(await isKeyExpired(stored))) {
    return stored;
  }

  // Generate fresh keypair
  const fresh = await generateEphemeralKeypair();
  await storeEphemeralKey(fresh);
  return fresh;
};

/**
 * Reconstruct Ed25519Keypair from stored secret key
 * Used for signing transactions
 */
export const reconstructKeypair = async (
  data: EphemeralKeyData,
): Promise<InstanceType<typeof import('@mysten/sui/keypairs/ed25519').Ed25519Keypair>> => {
  await loadSuiSdk();
  return Ed25519Keypair.fromSecretKey(data.secretKey);
};
