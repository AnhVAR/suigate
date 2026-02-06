/**
 * zkLogin OAuth Service
 * Main orchestrator for zkLogin authentication flow
 * Coordinates ephemeral key, OAuth, salt, and proof generation
 */

import { authZkLoginApiService } from '../api/auth-zklogin-api-service';
import { USE_MOCK_AUTH } from '../config/api-base-configuration';
import type { ZkLoginResponseDto } from '@suigate/shared-types';

// zkLogin services
import { getOrCreateEphemeralKey, clearEphemeralKey } from './zklogin/zklogin-ephemeral-keypair-service';
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
 * Initiate Google zkLogin - opens browser, returns PENDING
 * Call continueZkLoginWithJwt when OAuth callback received
 */
export const loginWithGoogle = async (): Promise<ZkLoginResult> => {
  try {
    // Clear old keys to start fresh with Enoki
    await clearEphemeralKey();

    // 1. Create new ephemeral keypair with nonce
    const ephemeralKey = await getOrCreateEphemeralKey();
    console.log('[zkLogin] Created ephemeral key, initiating OAuth...');

    // 2. Initiate Google OAuth with nonce (opens browser, returns PENDING)
    const oauthResult = await initiateGoogleLogin(ephemeralKey.nonce);

    // If PENDING, OAuth flow continues via deep link callback
    if (oauthResult.error === 'PENDING') {
      return { success: false, error: 'PENDING' };
    }

    // Unexpected: OAuth returned immediately (error case)
    if (!oauthResult.success) {
      return { success: false, error: oauthResult.error || 'OAuth failed' };
    }

    // Unexpected: OAuth returned JWT immediately - continue flow
    return continueZkLoginWithJwt(oauthResult.jwt!, oauthResult.decodedJwt!);
  } catch (error) {
    console.error('Google zkLogin error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
};

/**
 * Continue zkLogin flow after receiving JWT from OAuth callback
 * Steps 3-8: salt, proof, address, cache, backend auth
 */
export const continueZkLoginWithJwt = async (
  jwt: string,
  decodedJwt: { sub: string; email?: string; aud: string | string[] }
): Promise<ZkLoginResult> => {
  try {
    console.log('[zkLogin] Continuing with JWT...');
    const userId = decodedJwt.sub;

    // Load ephemeral key (created in loginWithGoogle)
    const ephemeralKey = await getOrCreateEphemeralKey();

    // 3. Get salt from Enoki (force refresh to get Enoki salt)
    console.log('[zkLogin] Getting salt from Enoki...');
    const salt = await getSalt(jwt, userId, true); // Force refresh for Enoki
    console.log('[zkLogin] Salt used for proof:', salt);

    // 4. Generate ZK proof from Enoki
    console.log('[zkLogin] Generating ZK proof...');
    const keypair = await reconstructKeypair(ephemeralKey);
    const extendedPubKey = await getExtendedPubKey(keypair);
    // Enoki expects Sui public key format (with scheme flag prefix)
    const ephemeralPublicKeyBase64 = keypair.getPublicKey().toSuiPublicKey();
    console.log('[zkLogin] Extended pubkey for prover:', extendedPubKey);
    console.log('[zkLogin] Ephemeral pubkey (Sui format):', ephemeralPublicKeyBase64);
    console.log('[zkLogin] maxEpoch for proof:', ephemeralKey.maxEpoch);
    console.log('[zkLogin] randomness (first 20):', ephemeralKey.randomness?.substring(0, 20));

    const proof = await generateZkProof({
      jwt,
      extendedEphemeralPublicKey: extendedPubKey,
      ephemeralPublicKeyBase64,
      maxEpoch: ephemeralKey.maxEpoch,
      randomness: ephemeralKey.randomness,
      salt,
    });

    // 5. Derive Sui address and address seed
    console.log('[zkLogin] Deriving address...');
    const { suiAddress, addressSeed } = await getAddressData(jwt, salt);

    // 6. Cache proof for session persistence
    await cacheProof(
      createCachedProofData(proof, addressSeed, ephemeralKey.maxEpoch, suiAddress)
    );

    // 7. Authenticate with backend
    console.log('[zkLogin] Authenticating with backend...');
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
      extendedPubKey, // Store for verification during signing
      salt, // Store for verification during signing
    };

    console.log('[zkLogin] Login complete!', { suiAddress });
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
    console.error('[zkLogin] Continue error:', error);
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
