/**
 * Type definitions for zkLogin authentication flow
 */

/**
 * Ephemeral keypair data stored in SecureStore
 * Contains all data needed to reconstruct the keypair and generate signatures
 */
export interface EphemeralKeyData {
  /** Base64 encoded Ed25519 secret key */
  secretKey: string;
  /** Base64 encoded public key */
  publicKey: string;
  /** Random bigint string used in nonce generation */
  randomness: string;
  /** Nonce = f(publicKey, maxEpoch, randomness) - passed to OAuth */
  nonce: string;
  /** Maximum epoch this keypair is valid for (~10 days from creation) */
  maxEpoch: number;
  /** Timestamp when keypair was created */
  createdAt: number;
}

/**
 * ZK proof response from Mysten prover service
 */
export interface ZkProofResponse {
  proofPoints: {
    a: string[];
    b: string[][];
    c: string[];
  };
  issBase64Details: {
    value: string;
    indexMod4: number;
  };
  headerBase64: string;
}

/**
 * Cached proof data stored in SecureStore
 */
export interface CachedProofData {
  proof: ZkProofResponse;
  addressSeed: string;
  maxEpoch: number;
  suiAddress: string;
  cachedAt: number;
}

/**
 * Complete zkLogin data needed for transaction signing
 */
export interface ZkLoginData {
  ephemeralKey: EphemeralKeyData;
  proof: ZkProofResponse;
  addressSeed: string;
  suiAddress: string;
  maxEpoch: number;
  /** Extended pubkey used during proof generation - for verification */
  extendedPubKey?: string;
  /** Salt used during proof generation - for verification */
  salt?: string;
}

/**
 * Result from OAuth flow
 */
export interface OAuthResult {
  success: boolean;
  jwt?: string;
  decodedJwt?: DecodedJwt;
  error?: string;
}

/**
 * Decoded JWT claims from Google OAuth
 */
export interface DecodedJwt {
  iss: string; // Issuer (https://accounts.google.com)
  sub: string; // Subject (Google user ID)
  aud: string; // Audience (OAuth client ID)
  nonce: string; // Ephemeral pubkey nonce
  email?: string;
  name?: string;
  picture?: string;
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}

/**
 * Session restore result
 */
export interface SessionRestoreResult {
  restored: boolean;
  zkLoginData?: ZkLoginData;
  requiresReAuth: boolean;
  reason?: 'expired' | 'missing' | 'invalid';
}
