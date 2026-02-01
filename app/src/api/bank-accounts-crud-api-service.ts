/**
 * Bank Accounts CRUD API Service
 * Handles bank account management endpoints
 */

import { apiClient } from './axios-client-with-auth-interceptors';
import type {
  CreateBankAccountDto,
  BankAccountDto,
  BankAccountListDto,
} from '@suigate/shared-types';

export const bankAccountsCrudApiService = {
  /**
   * List all user bank accounts
   */
  list: async (): Promise<BankAccountListDto> => {
    return apiClient.get<BankAccountListDto>('/bank-accounts');
  },

  /**
   * Create new bank account
   */
  create: async (dto: CreateBankAccountDto): Promise<BankAccountDto> => {
    return apiClient.post<BankAccountDto>('/bank-accounts', dto);
  },

  /**
   * Delete bank account
   */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/bank-accounts/${id}`);
  },

  /**
   * Set bank account as primary
   */
  setPrimary: async (id: number): Promise<BankAccountDto> => {
    return apiClient.patch<BankAccountDto>(`/bank-accounts/${id}/primary`, {});
  },
};
