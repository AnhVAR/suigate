import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BankAccount } from '../types/transaction.types';
import { bankAccountsCrudApiService } from '../api/bank-accounts-crud-api-service';
import type { CreateBankAccountDto, BankAccountDto } from '@suigate/shared-types';

const BANK_STORAGE_KEY = '@suigate:bank_accounts';

// Vietnam bank codes
export const VIETNAM_BANKS = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VTB', name: 'Vietinbank' },
  { code: 'TPB', name: 'TPBank' },
];

// Map backend DTO to local BankAccount type
const mapBankAccountDto = (dto: BankAccountDto): BankAccount => ({
  id: dto.id,
  bankCode: dto.bankCode,
  bankName: VIETNAM_BANKS.find((b) => b.code === dto.bankCode)?.name || dto.bankCode,
  accountNumber: dto.accountNumber, // Already masked by backend
  accountHolder: dto.accountHolder,
  isPrimary: dto.isPrimary,
});

interface BankAccountState {
  accounts: BankAccount[];
  isLoading: boolean;

  loadAccounts: () => Promise<void>;
  addAccount: (account: Omit<BankAccount, 'id'>) => Promise<void>;
  updateAccount: (id: number, updates: Partial<BankAccount>) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  setPrimary: (id: number) => Promise<void>;
  getPrimaryAccount: () => BankAccount | undefined;
}

export const useBankAccountStore = create<BankAccountState>((set, get) => ({
  accounts: [],
  isLoading: false,

  loadAccounts: async () => {
    set({ isLoading: true });
    try {
      // Try to fetch from API first
      const response = await bankAccountsCrudApiService.list();
      const accounts = response.accounts.map(mapBankAccountDto);

      // Cache locally
      await AsyncStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(accounts));
      set({ accounts, isLoading: false });
    } catch (error) {
      console.error('Failed to load bank accounts from API:', error);

      // Fallback to local cache
      try {
        const data = await AsyncStorage.getItem(BANK_STORAGE_KEY);
        if (data) {
          set({ accounts: JSON.parse(data), isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch (cacheError) {
        console.error('Failed to load from cache:', cacheError);
        set({ isLoading: false });
      }
    }
  },

  addAccount: async (account) => {
    try {
      // Create DTO for API
      const dto: CreateBankAccountDto = {
        bankCode: account.bankCode,
        accountNumber: account.accountNumber, // Send full number to API
        accountHolder: account.accountHolder,
        isPrimary: account.isPrimary,
      };

      // Call API
      await bankAccountsCrudApiService.create(dto);

      // Refresh list from backend
      await get().loadAccounts();
    } catch (error) {
      console.error('Failed to add bank account:', error);
      throw error;
    }
  },

  updateAccount: async (id, updates) => {
    // Not implemented in backend API for MVP
    const { accounts } = get();
    const updated = accounts.map((a) => (a.id === id ? { ...a, ...updates } : a));
    await AsyncStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(updated));
    set({ accounts: updated });
  },

  deleteAccount: async (id) => {
    try {
      // Call API to delete
      await bankAccountsCrudApiService.delete(id);

      // Refresh list from backend
      await get().loadAccounts();
    } catch (error) {
      console.error('Failed to delete bank account:', error);
      throw error;
    }
  },

  setPrimary: async (id) => {
    try {
      // Call API to set primary
      await bankAccountsCrudApiService.setPrimary(id);

      // Refresh list from backend
      await get().loadAccounts();
    } catch (error) {
      console.error('Failed to set primary account:', error);
      throw error;
    }
  },

  getPrimaryAccount: () => {
    return get().accounts.find((a) => a.isPrimary);
  },
}));
