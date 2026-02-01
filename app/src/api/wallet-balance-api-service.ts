/**
 * Wallet Balance API Service
 * Handles authenticated wallet endpoints
 */

import { apiClient } from './axios-client-with-auth-interceptors';
import type { WalletBalanceDto } from '@suigate/shared-types';

export const walletBalanceApiService = {
  /**
   * Get user's wallet balance (requires auth)
   */
  getBalance: async (): Promise<WalletBalanceDto> => {
    return apiClient.get<WalletBalanceDto>('/wallet/balance');
  },
};
