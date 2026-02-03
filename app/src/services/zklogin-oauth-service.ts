/**
 * zkLogin OAuth Service
 * Main orchestrator for zkLogin authentication flow
 * Coordinates ephemeral key, OAuth, salt, and proof generation
 */

import { authZkLoginApiService } from '../api/auth-zklogin-api-service';
import { USE_MOCK_AUTH } from '../config/api-base-configuration';
import type { ZkLoginResponseDto } from '@suigate/shared-types';

// zkLogin services
import { getOrCreateEphemeralKey } from './zklogin/zklogin-ephemeral-keypair-service';
import { initiateGoogleLogin } from './zklogin/zklogin-oauth-flow-service';
import { getSalt } from './zklogin/zklogin-salt-manager-service';
import {
  generateZkProof,
  getExtendedPubKey,
} from './zklogin/zklogin-prover-client-service';
import { getAddressData } from './zklogin/zklogin-address-derivation-service';
import {
  cacheProof,
  createCachedProofData,
} from './zklogin/zklogin-session-cache-service';
import { reconstructKeypair } from './zklogin/zklogin-ephemeral-keypair-service';
import type { ZkLoginData } from './zklogin/zklogin-types';

export interface ZkLoginResult {
  success: boolean;
  suiAddress?: string;
  email?: string;
  accessToken?: string;
  userId?: string;
  isNewUser?: boolean;
  zkLoginData?: ZkLoginData;
  error?: string;
}

/**
 * Complete Google zkLogin flow
 * 1. Generate/load ephemeral keypair
 * 2. Initiate Google OAuth with nonce
 * 3. Get salt from Mysten service
 * 4. Generate ZK proof
 * 5. Derive Sui address
 * 6. Authenticate with backend
 */
export const loginWithGoogle = async (): Promise<ZkLoginResult> => {
  try {
    // 1. Get or create ephemeral keypair with nonce
    const ephemeralKey = await getOrCreateEphemeralKey();

    // 2. Initiate Google OAuth with nonce
    const oauthResult = await initiateGoogleLogin(ephemeralKey.nonce);

    if (!oauthResult.success || !oauthResult.jwt || !oauthResult.decodedJwt) {
      return {
        success: false,
        error: oauthResult.error || 'OAuth failed',
      };
    }

    const { jwt, decodedJwt } = oauthResult;
    const userId = decodedJwt.sub;

    // 3. Get salt from Mysten salt service
    const salt = await getSalt(jwt, userId);

    // 4. Generate ZK proof from Mysten prover
    const keypair = await reconstructKeypair(ephemeralKey);
    const extendedPubKey = await getExtendedPubKey(keypair);

    const proof = await generateZkProof({
      jwt,
      extendedEphemeralPublicKey: extendedPubKey,
      maxEpoch: ephemeralKey.maxEpoch,
      randomness: ephemeralKey.randomness,
      salt,
    });

    // 5. Derive Sui address and address seed
    const { suiAddress, addressSeed } = await getAddressData(jwt, salt);

    // 6. Cache proof for session persistence
    await cacheProof(
      createCachedProofData(proof, addressSeed, ephemeralKey.maxEpoch, suiAddress)
    );

    // 7. Authenticate with backend
    const backendResponse = await authZkLoginApiService.zkLogin({
      jwt,
      suiAddress,
      salt,
      provider: 'google',
    });

    // 8. Construct zkLoginData for transaction signing
    const zkLoginData: ZkLoginData = {
      ephemeralKey,
      proof,
      addressSeed,
      suiAddress,
      maxEpoch: ephemeralKey.maxEpoch,
    };

    return {
      success: true,
      suiAddress,
      email: decodedJwt.email,
      accessToken: backendResponse.accessToken,
      userId: backendResponse.userId,
      isNewUser: backendResponse.isNewUser,
      zkLoginData,
    };
  } catch (error) {
    console.error('Google zkLogin error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
};

/**
 * Apple login - deferred to post-hackathon per validation decision
 */
export const loginWithApple = async (): Promise<ZkLoginResult> => {
  return {
    success: false,
    error: 'Apple login coming soon - use Google for now',
  };
};
