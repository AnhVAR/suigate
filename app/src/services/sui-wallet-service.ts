/**
 * Sui Wallet Service
 * Fetches USDC balance and handles blockchain interactions
 */

// USDC coin type on Sui (native USDC)
const USDC_COIN_TYPE =
  '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';

// Mock rate for demo (real: fetch from Binance API)
const MOCK_VND_RATE = 25000; // 1 USDC = 25,000 VND

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
