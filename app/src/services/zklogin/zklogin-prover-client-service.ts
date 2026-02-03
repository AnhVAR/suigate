/**
 * Prover client service for zkLogin
 * Calls Mysten Labs prover service to generate ZK proofs
 * Uses dynamic imports to defer Sui SDK loading until after polyfills
 */

import type { ZkProofResponse } from './zklogin-types';

// Lazy-loaded Sui SDK function
let getExtendedEphemeralPublicKey: typeof import('@mysten/sui/zklogin').getExtendedEphemeralPublicKey;

/** Load Sui zklogin module dynamically */
const loadZkLoginModule = async () => {
  if (!getExtendedEphemeralPublicKey) {
    const module = await import('@mysten/sui/zklogin');
    getExtendedEphemeralPublicKey = module.getExtendedEphemeralPublicKey;
  }
};

// Testnet prover URL (per validation decision)
const PROVER_URL = 'https://prover-dev.mystenlabs.com/v1';

interface ProverParams {
  jwt: string;
  extendedEphemeralPublicKey: string;
  maxEpoch: number;
  randomness: string;
  salt: string;
}

/**
 * Generate ZK proof from Mysten Labs prover service
 * This proof is used to create zkLogin signatures
 *
 * @param params - Parameters for proof generation
 * @returns ZK proof response containing proof points and metadata
 */
export const generateZkProof = async (
  params: ProverParams
): Promise<ZkProofResponse> => {
  const response = await fetch(PROVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jwt: params.jwt,
      extendedEphemeralPublicKey: params.extendedEphemeralPublicKey,
      maxEpoch: params.maxEpoch.toString(),
      jwtRandomness: params.randomness,
      salt: params.salt,
      keyClaimName: 'sub',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Prover error: ${response.status} - ${errorText}`);
  }

  return response.json();
};

/**
 * Get extended ephemeral public key for prover
 * The prover requires the extended format, not the raw public key
 */
export const getExtendedPubKey = async (
  keypair: InstanceType<typeof import('@mysten/sui/keypairs/ed25519').Ed25519Keypair>,
): Promise<string> => {
  await loadZkLoginModule();
  return getExtendedEphemeralPublicKey(keypair.getPublicKey());
};
