/**
 * Lightweight Sui RPC Balance Service
 * Uses direct fetch to avoid SDK polyfill issues in React Native
 */

const SUI_TESTNET_RPC = 'https://fullnode.testnet.sui.io:443';
const TEST_USDC_TYPE =
  '0xfda5e7d874aee36569b18e6df8c62693e93c8dfa76e317543aa9bb827ed91d13::test_usdc::TEST_USDC';

interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

interface BalanceResult {
  totalBalance: string;
  coinType: string;
  coinObjectCount: number;
}

/**
 * Fetch TEST_USDC balance directly from Sui RPC
 */
export const fetchUsdcBalanceFromRpc = async (
  suiAddress: string
): Promise<number> => {
  const response = await fetch(SUI_TESTNET_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_getBalance',
      params: [suiAddress, TEST_USDC_TYPE],
    }),
  });

  const data: RpcResponse<BalanceResult> = await response.json();

  if (data.error) {
    console.warn('RPC error:', data.error.message);
    return 0;
  }

  // TEST_USDC has 6 decimals
  return Number(data.result?.totalBalance || 0) / 1_000_000;
};

/**
 * Fetch current rate from backend
 */
export const fetchRateFromBackend = async (): Promise<number> => {
  try {
    const apiUrl =
      process.env.EXPO_PUBLIC_API_URL || 'http://192.168.2.34:3000';
    const response = await fetch(`${apiUrl}/rates/current`);
    if (response.ok) {
      const data = await response.json();
      return data.sellRate || 25000;
    }
  } catch (error) {
    console.warn('Failed to fetch rate:', error);
  }
  return 25000; // Fallback rate
};
