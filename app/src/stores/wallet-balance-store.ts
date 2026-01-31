import { create } from 'zustand';
import { fetchWalletBalance } from '../services/sui-wallet-service';

interface WalletState {
  usdcBalance: number;
  vndEquivalent: number;
  rate: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;

  fetchBalance: (suiAddress: string) => Promise<void>;
  resetBalance: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  usdcBalance: 0,
  vndEquivalent: 0,
  rate: 25000,
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchBalance: async (suiAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const { usdc, vndEquivalent, rate } = await fetchWalletBalance(suiAddress);
      set({
        usdcBalance: usdc,
        vndEquivalent,
        rate,
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
