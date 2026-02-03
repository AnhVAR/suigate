/**
 * Sui Wallet Service
 * Handles balance fetching and zkLogin transaction signing
 */

import { Transaction } from '@mysten/sui/transactions';
import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { getZkLoginSignature } from '@mysten/sui/zklogin';
import { reconstructKeypair } from './zklogin/zklogin-ephemeral-keypair-service';
import type { ZkLoginData } from './zklogin/zklogin-types';

// USDC coin type on Sui (native USDC)
const USDC_COIN_TYPE =
  '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';

// Mock rate for demo (real: fetch from Binance API)
const MOCK_VND_RATE = 25000; // 1 USDC = 25,000 VND

/** Create SuiClient for testnet */
const createSuiClient = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl('testnet') } as any);

export interface WalletBalance {
  usdc: number;
  vndEquivalent: number;
  rate: number;
}

export const fetchWalletBalance = async (
  suiAddress: string
): Promise<WalletBalance> => {
  try {
    // MVP: Simulated balance fetch
    // Production: Use Sui SDK to query USDC balance
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Demo balance
    const usdcBalance = 150.0;
    const rate = MOCK_VND_RATE;

    return {
      usdc: usdcBalance,
      vndEquivalent: usdcBalance * rate,
      rate,
    };
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    throw error;
  }
};

export const fetchCurrentRate = async (): Promise<number> => {
  // MVP: Return mock rate
  // Production: Fetch from Binance/CoinGecko
  return MOCK_VND_RATE;
};

/**
 * Fetch real SUI balance from testnet
 */
export const fetchSuiBalance = async (suiAddress: string): Promise<bigint> => {
  const client = createSuiClient();
  const balance = await client.getBalance({
    owner: suiAddress,
    coinType: '0x2::sui::SUI',
  });
  return BigInt(balance.totalBalance);
};

/**
 * Sign and execute transaction with zkLogin
 * This is the core function for executing any transaction with zkLogin credentials
 */
export const signAndExecuteWithZkLogin = async (
  txb: Transaction,
  zkLoginData: ZkLoginData
): Promise<{ digest: string; effects: unknown }> => {
  const client = createSuiClient();

  // Set sender address
  txb.setSender(zkLoginData.suiAddress);

  // Sign with ephemeral keypair
  const keypair = reconstructKeypair(zkLoginData.ephemeralKey);
  const { bytes, signature: userSignature } = await txb.sign({
    client,
    signer: keypair,
  });

  // Assemble zkLogin signature
  const zkLoginSignature = getZkLoginSignature({
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
    signature: zkLoginSignature,
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
): Transaction => {
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
  txb: Transaction,
  sender: string
): Promise<bigint> => {
  const client = createSuiClient();
  txb.setSender(sender);

  const dryRunResult = await client.dryRunTransactionBlock({
    transactionBlock: await txb.build({ client }),
  });

  return BigInt(dryRunResult.input.gasData.budget);
};
