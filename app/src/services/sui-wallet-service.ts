/**
 * Sui Wallet Service
 * Handles balance fetching and zkLogin transaction signing
 * Uses dynamic imports to defer Sui SDK loading until after polyfills
 */

import { reconstructKeypair } from './zklogin/zklogin-ephemeral-keypair-service';
import { getExtendedPubKey } from './zklogin/zklogin-prover-client-service';
import type { ZkLoginData } from './zklogin/zklogin-types';

// TEST_USDC coin type on Sui Testnet
const TEST_USDC_TYPE =
  '0xfda5e7d874aee36569b18e6df8c62693e93c8dfa76e317543aa9bb827ed91d13::test_usdc::TEST_USDC';

const FALLBACK_VND_RATE = 25000;

// Lazy-loaded Sui SDK modules (only Transaction and zkLogin - no jsonRpc due to RN compat issues)
let Transaction: any = null;
let getZkLoginSignature: any = null;

// Testnet RPC URL
const TESTNET_RPC = 'https://fullnode.testnet.sui.io:443';

/** Load Sui SDK modules dynamically */
const loadSuiModules = async () => {
  if (!Transaction) {
    const tx = await import('@mysten/sui/transactions');
    Transaction = tx.Transaction;
  }
  if (!getZkLoginSignature) {
    const zklogin = await import('@mysten/sui/zklogin');
    getZkLoginSignature = zklogin.getZkLoginSignature;
  }
};

export interface WalletBalance {
  usdc: number;
  vndEquivalent: number;
  rate: number;
}

/** Direct RPC call to get balance */
const getBalanceRpc = async (owner: string, coinType: string): Promise<string> => {
  const response = await fetch(TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_getBalance',
      params: [owner, coinType],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result?.totalBalance || '0';
};

export const fetchWalletBalance = async (
  suiAddress: string,
  rate?: number
): Promise<WalletBalance> => {
  try {
    const totalBalance = await getBalanceRpc(suiAddress, TEST_USDC_TYPE);
    const usdcBalance = Number(totalBalance) / 1_000_000;
    const currentRate = rate || FALLBACK_VND_RATE;

    return {
      usdc: usdcBalance,
      vndEquivalent: usdcBalance * currentRate,
      rate: currentRate,
    };
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    throw error;
  }
};

export const fetchCurrentRate = async (): Promise<number> => {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.2.34:3000';
    const response = await fetch(`${apiUrl}/rates/current`);
    if (response.ok) {
      const data = await response.json();
      return data.sellRate || FALLBACK_VND_RATE;
    }
  } catch (error) {
    console.warn('Failed to fetch rate:', error);
  }
  return FALLBACK_VND_RATE;
};

/**
 * Fetch real SUI balance from testnet
 */
export const fetchSuiBalance = async (suiAddress: string): Promise<bigint> => {
  const totalBalance = await getBalanceRpc(suiAddress, '0x2::sui::SUI');
  return BigInt(totalBalance);
};

/** Direct RPC call to execute transaction */
const executeTransactionRpc = async (
  txBytes: string,
  signature: string
): Promise<{ digest: string; effects: any }> => {
  const response = await fetch(TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_executeTransactionBlock',
      params: [txBytes, [signature], { showEffects: true, showEvents: true }, 'WaitForLocalExecution'],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return { digest: data.result.digest, effects: data.result.effects };
};

/** Direct RPC call to get reference gas price */
const getReferenceGasPriceRpc = async (): Promise<string> => {
  const response = await fetch(TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_getReferenceGasPrice',
      params: [],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
};

/** Get object info via RPC */
const getObjectRpc = async (objectId: string): Promise<{ objectId: string; version: string; digest: string }> => {
  const response = await fetch(TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getObject',
      params: [objectId, { showContent: false }],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  if (!data.result?.data) throw new Error(`Object not found: ${objectId}`);
  return {
    objectId: data.result.data.objectId,
    version: data.result.data.version,
    digest: data.result.data.digest,
  };
};

/** Get SUI coins for gas via RPC */
const getSuiCoinsRpc = async (owner: string): Promise<any[]> => {
  const response = await fetch(TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_getCoins',
      params: [owner, '0x2::sui::SUI', null, 10],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result?.data || [];
};

/** Get API URL */
const getApiUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_URL || 'http://192.168.2.34:3000';
};


/** Get auth token from secure storage */
const getAuthToken = async (): Promise<string | null> => {
  const { getAccessToken } = await import('../api/secure-token-storage');
  return getAccessToken();
};

/**
 * Execute Enoki-sponsored transaction via backend
 * Backend calls Enoki API to finalize execution with user's zkLogin signature
 */
const executeEnokiSponsoredViaBackend = async (
  digest: string,
  userSignature: string
): Promise<{ digest: string; success: boolean }> => {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${getApiUrl()}/wallet/execute-enoki-sponsored`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ digest, userSignature }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to execute transaction');
  }

  return response.json();
};

/**
 * Sign and execute transaction with zkLogin (self-paid gas - user must have SUI)
 */
export const signAndExecuteWithZkLogin = async (
  txb: any,
  zkLoginData: ZkLoginData
): Promise<{ digest: string; effects: unknown }> => {
  await loadSuiModules();

  // Get gas coins for the sender
  const gasCoins = await getSuiCoinsRpc(zkLoginData.suiAddress);
  if (!gasCoins.length) {
    throw new Error('No SUI coins for gas. Please get some testnet SUI first.');
  }

  // Set sender and gas config
  txb.setSender(zkLoginData.suiAddress);
  const gasPrice = await getReferenceGasPriceRpc();
  txb.setGasPrice(BigInt(gasPrice));
  txb.setGasBudget(BigInt(50000000));

  // Set explicit gas payment with object refs
  txb.setGasPayment([{
    objectId: gasCoins[0].coinObjectId,
    version: gasCoins[0].version,
    digest: gasCoins[0].digest,
  }]);

  // Build transaction locally
  const txBytesArray = await txb.build();

  // Sign with ephemeral keypair
  const keypair = await reconstructKeypair(zkLoginData.ephemeralKey);
  const { signature: userSignature } = await keypair.signTransaction(txBytesArray);

  // Assemble zkLogin signature
  const zkLoginSig = getZkLoginSignature({
    inputs: {
      ...zkLoginData.proof,
      addressSeed: zkLoginData.addressSeed,
    },
    maxEpoch: zkLoginData.maxEpoch,
    userSignature,
  });

  // Execute transaction
  const result = await executeTransactionRpc(
    Buffer.from(txBytesArray).toString('base64'),
    zkLoginSig
  );

  return { digest: result.digest, effects: result.effects };
};

/**
 * Build a SUI transfer transaction
 */
export const buildSuiTransferTransaction = async (
  recipient: string,
  amountMist: bigint
): Promise<any> => {
  await loadSuiModules();
  const txb = new Transaction();
  const [coin] = txb.splitCoins(txb.gas, [amountMist]);
  txb.transferObjects([coin], recipient);
  return txb;
};

/**
 * High-level function to transfer SUI with zkLogin
 */
export const transferSuiWithZkLogin = async (
  recipient: string,
  amountMist: bigint,
  zkLoginData: ZkLoginData
): Promise<{ digest: string; success: boolean }> => {
  const txb = await buildSuiTransferTransaction(recipient, amountMist);
  const result = await signAndExecuteWithZkLogin(txb, zkLoginData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effects = result.effects as any;
  return {
    digest: result.digest,
    success: effects?.status?.status === 'success',
  };
};

/**
 * Estimate gas for a transaction (returns default budget since we can't dry run without client)
 */
export const estimateGas = async (
  _txb: any,
  _sender: string
): Promise<bigint> => {
  // Return a safe default gas budget (50M MIST = 0.05 SUI)
  // In React Native without full SDK, we can't easily dry run
  return BigInt(50000000);
};

/** Direct RPC call to get coins (avoids SuiClient compatibility issues) */
const getCoinsRpc = async (owner: string, coinType: string): Promise<any[]> => {
  const response = await fetch(TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_getCoins',
      params: [owner, coinType, null, 50],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result?.data || [];
};

/**
 * Build deposit transaction for Quick Sell (deposit USDC to liquidity pool)
 */
export const buildDepositTransaction = async (
  poolObjectId: string,
  packageId: string,
  usdcType: string,
  amountMist: string,
  senderAddress: string
): Promise<any> => {
  await loadSuiModules();

  // Get USDC coins owned by sender via direct RPC
  const coins = await getCoinsRpc(senderAddress, usdcType);

  if (!coins || coins.length === 0) {
    throw new Error('No USDC coins found in wallet');
  }

  const txb = new Transaction();
  const amount = BigInt(amountMist);

  // Use explicit object refs for coins (not just IDs)
  const coinRefs = coins.map((c: any) => txb.objectRef({
    objectId: c.coinObjectId,
    version: c.version,
    digest: c.digest,
  }));

  if (coinRefs.length > 1) {
    // Merge all coins into first one
    txb.mergeCoins(coinRefs[0], coinRefs.slice(1));
  }

  // Split exact amount needed
  const [depositCoin] = txb.splitCoins(coinRefs[0], [amount]);

  // Call deposit function on liquidity pool
  // Pool is SHARED object - use object() not objectRef()
  txb.moveCall({
    target: `${packageId}::liquidity_pool::deposit`,
    typeArguments: [usdcType],
    arguments: [
      txb.object(poolObjectId),
      depositCoin,
    ],
  });

  return txb;
};

/**
 * Sponsor deposit via backend (backend builds tx with SuiClient)
 * This is the production method that handles shared objects correctly
 */
const sponsorDepositViaBackend = async (
  amountMist: string
): Promise<{ txBytesBase64: string; digest: string }> => {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${getApiUrl()}/wallet/sponsor-deposit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amountMist }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to sponsor deposit');
  }

  return response.json();
};

/** Get current epoch from RPC */
const getCurrentEpochRpc = async (): Promise<number> => {
  const response = await fetch(TESTNET_RPC, {
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
  return Number(data.result?.epoch || 0);
};

/**
 * Execute Quick Sell deposit with zkLogin (sponsored by Enoki via backend)
 * Backend builds tx with SuiClient (handles shared objects correctly)
 * Flow: Backend builds+sponsors tx -> App signs with zkLogin -> Backend executes
 */
export const executeQuickSellDeposit = async (
  depositPayload: {
    poolObjectId: string;
    packageId: string;
    usdcType: string;
    amountMist: string;
    orderId?: string;
  },
  zkLoginData: ZkLoginData
): Promise<{ digest: string; success: boolean }> => {
  await loadSuiModules();

  // Validate zkLogin session
  const currentEpoch = await getCurrentEpochRpc();
  if (currentEpoch >= zkLoginData.maxEpoch) {
    throw new Error(
      `zkLogin session expired. Current epoch ${currentEpoch} >= max ${zkLoginData.maxEpoch}. Please re-login.`
    );
  }

  // Backend builds tx with SuiClient (handles shared objects correctly)
  const sponsored = await sponsorDepositViaBackend(depositPayload.amountMist);
  const { txBytesBase64, digest } = sponsored;

  // Sign with zkLogin
  const txBytesArray = Uint8Array.from(Buffer.from(txBytesBase64, 'base64'));
  const keypair = await reconstructKeypair(zkLoginData.ephemeralKey);
  const { signature: userSignature } = await keypair.signTransaction(txBytesArray);

  const zkLoginSig = getZkLoginSignature({
    inputs: {
      ...zkLoginData.proof,
      addressSeed: zkLoginData.addressSeed,
    },
    maxEpoch: zkLoginData.maxEpoch,
    userSignature,
  });

  // Execute via Enoki backend
  return executeEnokiSponsoredViaBackend(digest, zkLoginSig);
};
