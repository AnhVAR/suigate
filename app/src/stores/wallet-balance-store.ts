import { create } from 'zustand';
import { useAuthStore } from './authentication-store';

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

export const useWalletStore = create<WalletState>((set, get) => ({
  usdcBalance: 0,
  vndEquivalent: 0,
  rate: 25000,
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchBalance: async () => {
    const suiAddress = useAuthStore.getState().suiAddress;
    if (!suiAddress) {
      set({ error: 'No wallet address', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Use direct RPC fetch (SDK not compatible with React Native)
      const { fetchUsdcBalanceFromRpc, fetchRateFromBackend } = await import(
        '../services/sui-rpc-balance-service'
      );

      const rate = await fetchRateFromBackend();
      const usdcBalance = await fetchUsdcBalanceFromRpc(suiAddress);
      const balance = { usdc: usdcBalance, vndEquivalent: usdcBalance * rate, rate };

      set({
        usdcBalance: balance.usdc,
        vndEquivalent: balance.vndEquivalent,
        rate: balance.rate,
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
    // Same as fetchBalance - refresh from RPC
    await get().fetchBalance();
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
