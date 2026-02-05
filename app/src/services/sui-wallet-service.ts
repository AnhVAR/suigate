/**
 * Sui Wallet Service
 * Handles balance fetching and zkLogin transaction signing
 * Uses dynamic imports to defer Sui SDK loading until after polyfills
 */

import { reconstructKeypair } from './zklogin/zklogin-ephemeral-keypair-service';
import type { ZkLoginData } from './zklogin/zklogin-types';

// TEST_USDC coin type on Sui Testnet
const TEST_USDC_TYPE =
  '0xfda5e7d874aee36569b18e6df8c62693e93c8dfa76e317543aa9bb827ed91d13::test_usdc::TEST_USDC';

const FALLBACK_VND_RATE = 25000;

// Lazy-loaded Sui SDK modules
let SuiJsonRpcClient: any = null;
let Transaction: any = null;
let getZkLoginSignature: any = null;

// Testnet RPC URL (hardcoded to avoid import issues)
const TESTNET_RPC = 'https://fullnode.testnet.sui.io:443';

/** Load Sui SDK modules dynamically */
const loadSuiModules = async () => {
  if (!SuiJsonRpcClient) {
    const jsonRpc = await import('@mysten/sui/jsonRpc');
    SuiJsonRpcClient = jsonRpc.SuiJsonRpcClient;
  }
  if (!Transaction) {
    const tx = await import('@mysten/sui/transactions');
    Transaction = tx.Transaction;
  }
  if (!getZkLoginSignature) {
    const zklogin = await import('@mysten/sui/zklogin');
    getZkLoginSignature = zklogin.getZkLoginSignature;
  }
};

/** Create SuiClient for testnet */
const createSuiClient = async () => {
  await loadSuiModules();
  return new SuiJsonRpcClient({ url: TESTNET_RPC });
};

export interface WalletBalance {
  usdc: number;
  vndEquivalent: number;
  rate: number;
}

export const fetchWalletBalance = async (
  suiAddress: string,
  rate?: number
): Promise<WalletBalance> => {
  try {
    const client = await createSuiClient();

    // Query TEST_USDC balance from Sui RPC
    const balance = await client.getBalance({
      owner: suiAddress,
      coinType: TEST_USDC_TYPE,
    });

    const usdcBalance = Number(balance.totalBalance) / 1_000_000;
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
  const client = await createSuiClient();
  const balance = await client.getBalance({
    owner: suiAddress,
    coinType: '0x2::sui::SUI',
  });
  return BigInt(balance.totalBalance);
};

/**
 * Sign and execute transaction with zkLogin
 */
export const signAndExecuteWithZkLogin = async (
  txb: any,
  zkLoginData: ZkLoginData
): Promise<{ digest: string; effects: unknown }> => {
  await loadSuiModules();
  const client = await createSuiClient();

  // Set sender address
  txb.setSender(zkLoginData.suiAddress);

  // Sign with ephemeral keypair
  const keypair = await reconstructKeypair(zkLoginData.ephemeralKey);
  const { bytes, signature: userSignature } = await txb.sign({
    client,
    signer: keypair,
  });

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
  const result = await client.executeTransactionBlock({
    transactionBlock: bytes,
    signature: zkLoginSig,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  return {
    digest: result.digest,
    effects: result.effects,
  };
};

/**
 * Build a SUI transfer transaction
 */
export const buildSuiTransferTransaction = (
  recipient: string,
  amountMist: bigint
): any => {
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
  const txb = buildSuiTransferTransaction(recipient, amountMist);
  const result = await signAndExecuteWithZkLogin(txb, zkLoginData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effects = result.effects as any;
  return {
    digest: result.digest,
    success: effects?.status?.status === 'success',
  };
};

/**
 * Estimate gas for a transaction (dry run)
 */
export const estimateGas = async (
  txb: any,
  sender: string
): Promise<bigint> => {
  const client = await createSuiClient();
  txb.setSender(sender);

  const dryRunResult = await client.dryRunTransactionBlock({
    transactionBlock: await txb.build({ client }),
  });

  return BigInt(dryRunResult.input.gasData.budget);
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
  const client = await createSuiClient();

  // Get USDC coins owned by sender
  const coins = await client.getCoins({
    owner: senderAddress,
    coinType: usdcType,
  });

  if (!coins.data || coins.data.length === 0) {
    throw new Error('No USDC coins found in wallet');
  }

  const txb = new Transaction();
  const amount = BigInt(amountMist);

  // Merge coins if needed and split exact amount
  const coinIds = coins.data.map((c: any) => c.coinObjectId);

  if (coinIds.length > 1) {
    // Merge all coins into first one
    txb.mergeCoins(coinIds[0], coinIds.slice(1));
  }

  // Split exact amount needed
  const [depositCoin] = txb.splitCoins(coinIds[0], [amount]);

  // Call deposit function on liquidity pool
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
 * Execute Quick Sell deposit with zkLogin
 */
export const executeQuickSellDeposit = async (
  depositPayload: {
    poolObjectId: string;
    packageId: string;
    usdcType: string;
    amountMist: string;
  },
  zkLoginData: ZkLoginData
): Promise<{ digest: string; success: boolean }> => {
  const txb = await buildDepositTransaction(
    depositPayload.poolObjectId,
    depositPayload.packageId,
    depositPayload.usdcType,
    depositPayload.amountMist,
    zkLoginData.suiAddress
  );

  const result = await signAndExecuteWithZkLogin(txb, zkLoginData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effects = result.effects as any;
  return {
    digest: result.digest,
    success: effects?.status?.status === 'success',
  };
};
