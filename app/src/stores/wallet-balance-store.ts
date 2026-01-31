import { create } from 'zustand';

interface WalletState {
  usdcBalance: number;
  isLoading: boolean;
  error: string | null;
  setBalance: (balance: number) => void;
  fetchBalance: (suiAddress: string) => Promise<void>;
  resetBalance: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  usdcBalance: 0,
  isLoading: false,
  error: null,

  setBalance: (balance: number) => {
    set({ usdcBalance: balance, error: null });
  },

  fetchBalance: async (suiAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual Sui blockchain balance fetching
      // This is a placeholder that will be implemented in Phase 2
      console.log('Fetching balance for:', suiAddress);

      // Simulated delay for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Placeholder balance - will be replaced with actual blockchain query
      set({ usdcBalance: 0, isLoading: false });
    } catch (error) {
      console.error('Fetch balance error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
        isLoading: false
      });
    }
  },

  resetBalance: () => {
    set({ usdcBalance: 0, isLoading: false, error: null });
  },
}));
