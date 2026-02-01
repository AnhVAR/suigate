import { create } from 'zustand';
import { walletBalanceApiService } from '../api/wallet-balance-api-service';

interface WalletState {
  usdcBalance: number;
  vndEquivalent: number;
  rate: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;

  fetchBalance: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  resetBalance: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  usdcBalance: 0,
  vndEquivalent: 0,
  rate: 25000,
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      const balance = await walletBalanceApiService.getBalance();

      // Parse string amounts to numbers
      const usdcBalance = parseFloat(balance.usdcBalance);
      const vndEquivalent = parseFloat(balance.usdcBalanceVnd);

      set({
        usdcBalance,
        vndEquivalent,
        rate: 25000, // Default rate, will be updated from rates API
        isLoading: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
        isLoading: false,
      });
    }
  },

  refreshBalance: async () => {
    // Same as fetchBalance for now
    set({ isLoading: true, error: null });
    try {
      const balance = await walletBalanceApiService.getBalance();

      const usdcBalance = parseFloat(balance.usdcBalance);
      const vndEquivalent = parseFloat(balance.usdcBalanceVnd);

      set({
        usdcBalance,
        vndEquivalent,
        rate: 25000, // Default rate
        isLoading: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh balance',
        isLoading: false,
      });
    }
  },

  resetBalance: () => {
    set({
      usdcBalance: 0,
      vndEquivalent: 0,
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  },
}));
