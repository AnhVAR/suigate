/**
 * zkLogin services barrel export
 * Re-exports all zkLogin related services and types
 */

// Types
export type {
  EphemeralKeyData,
  ZkProofResponse,
  CachedProofData,
  ZkLoginData,
  OAuthResult,
  DecodedJwt,
  SessionRestoreResult,
} from './zklogin-types';

// Ephemeral keypair service
export {
  generateEphemeralKeypair,
  storeEphemeralKey,
  loadEphemeralKey,
  clearEphemeralKey,
  isKeyExpired,
  getOrCreateEphemeralKey,
  reconstructKeypair,
} from './zklogin-ephemeral-keypair-service';

// OAuth flow service
export {
  initiateGoogleLogin,
  decodeAndValidateJwt,
  extractSubFromJwt,
  extractAudFromJwt,
} from './zklogin-oauth-flow-service';

// Salt manager service
export {
  getSalt,
  cacheSalt,
  loadCachedSalt,
  clearSalt,
} from './zklogin-salt-manager-service';

// Prover client service
export {
  generateZkProof,
  getExtendedPubKey,
} from './zklogin-prover-client-service';

// Address derivation service
export {
  deriveAddress,
  computeAddressSeed,
  extractJwtClaims,
  getAddressData,
} from './zklogin-address-derivation-service';

// Session cache service
export {
  cacheProof,
  loadCachedProof,
  isProofValid,
  clearProofCache,
  createCachedProofData,
} from './zklogin-session-cache-service';

// Session restore service
export {
  restoreSession,
  clearExpiredSession,
  clearAllZkLoginData,
} from './zklogin-session-restore-service';
