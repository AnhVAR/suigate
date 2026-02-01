/**
 * App Initialization Hook
 * Handles app startup: check auth, fetch initial data
 */

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authentication-store';
import { useWalletStore } from '../stores/wallet-balance-store';
import { useBankAccountStore } from '../stores/bank-account-store';

/**
 * Hook to initialize app on startup
 */
export const useAppInitialization = () => {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const { fetchBalance } = useWalletStore();
  const { loadAccounts } = useBankAccountStore();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Fetch wallet balance and bank accounts in parallel
      Promise.all([
        fetchBalance().catch((err) =>
          console.error('Failed to fetch balance:', err)
        ),
        loadAccounts().catch((err) =>
          console.error('Failed to load bank accounts:', err)
        ),
      ]);
    }
  }, [isAuthenticated, isLoading]);

  return { isLoading };
};
