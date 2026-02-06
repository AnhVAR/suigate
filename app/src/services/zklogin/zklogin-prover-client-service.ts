/**
 * Prover client service for zkLogin
 * Calls Enoki (Mysten's hosted zkLogin service) to generate ZK proofs
 * Uses dynamic imports to defer Sui SDK loading until after polyfills
 */

import { toBigIntBE } from 'bigint-buffer';
import type { ZkProofResponse } from './zklogin-types';
import {
  ENOKI_BASE_URL,
  getEnokiHeaders,
} from '../../config/api-base-configuration';

interface ProverParams {
  jwt: string;
  extendedEphemeralPublicKey: string;
  ephemeralPublicKeyBase64: string; // Base64 format for Enoki
  maxEpoch: number;
  randomness: string;
  salt: string;
}

/**
 * Generate ZK proof from Enoki service
 * This proof is used to create zkLogin signatures
 *
 * @param params - Parameters for proof generation
 * @returns ZK proof response containing proof points and metadata
 */
export const generateZkProof = async (
  params: ProverParams
): Promise<ZkProofResponse> => {
  const requestBody = {
    network: 'testnet',
    randomness: params.randomness,
    maxEpoch: params.maxEpoch,
    ephemeralPublicKey: params.ephemeralPublicKeyBase64,
  };

  console.log('[Prover] Enoki ZKP request:');
  console.log('  - network:', requestBody.network);
  console.log('  - ephemeralPublicKey:', requestBody.ephemeralPublicKey);
  console.log('  - maxEpoch:', requestBody.maxEpoch);
  console.log('  - randomness (first 20):', requestBody.randomness?.substring(0, 20));

  const response = await fetch(`${ENOKI_BASE_URL}/zklogin/zkp`, {
    method: 'POST',
    headers: getEnokiHeaders(params.jwt),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Enoki ZKP error: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('[Prover] Enoki raw response:', JSON.stringify(responseData).substring(0, 200));

  // Enoki wraps response in "data" object
  const proofResponse = responseData.data || responseData;
  console.log('[Prover] Enoki response received:');
  console.log('  - proofPoints.a[0] (first 20):', proofResponse.proofPoints?.a?.[0]?.substring(0, 20));
  console.log('  - issBase64Details.indexMod4:', proofResponse.issBase64Details?.indexMod4);

  return proofResponse;
};

/**
 * Get extended ephemeral public key for prover
 * Using Mysten POC pattern: convert public key bytes to BigInt string
 * NOT using SDK's getExtendedEphemeralPublicKey (returns different format)
 */
export const getExtendedPubKey = async (
  keypair: InstanceType<typeof import('@mysten/sui/keypairs/ed25519').Ed25519Keypair>,
): Promise<string> => {
  // Get public key as base64, decode to bytes, convert to BigInt string
  // This matches the official Mysten React Native POC pattern
  const pubKeyBase64 = keypair.getPublicKey().toBase64();
  const pubKeyBytes = Buffer.from(pubKeyBase64, 'base64');
  return toBigIntBE(pubKeyBytes).toString();
};
