import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BankAccount } from '../types/transaction.types';

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
      const data = await AsyncStorage.getItem(BANK_STORAGE_KEY);
      if (data) {
        set({ accounts: JSON.parse(data) });
      }
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addAccount: async (account) => {
    const { accounts } = get();
    const newId = accounts.length > 0 ? Math.max(...accounts.map((a) => a.id)) + 1 : 1;
    const isFirst = accounts.length === 0;

    const newAccount: BankAccount = {
      ...account,
      id: newId,
      isPrimary: isFirst ? true : account.isPrimary,
    };

    const updated = [...accounts, newAccount];
    await AsyncStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(updated));
    set({ accounts: updated });
  },

  updateAccount: async (id, updates) => {
    const { accounts } = get();
    const updated = accounts.map((a) => (a.id === id ? { ...a, ...updates } : a));
    await AsyncStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(updated));
    set({ accounts: updated });
  },

  deleteAccount: async (id) => {
    const { accounts } = get();
    const updated = accounts.filter((a) => a.id !== id);
    // If deleted was primary, set first remaining as primary
    if (updated.length > 0 && !updated.some((a) => a.isPrimary)) {
      updated[0].isPrimary = true;
    }
    await AsyncStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(updated));
    set({ accounts: updated });
  },

  setPrimary: async (id) => {
    const { accounts } = get();
    const updated = accounts.map((a) => ({
      ...a,
      isPrimary: a.id === id,
    }));
    await AsyncStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(updated));
    set({ accounts: updated });
  },

  getPrimaryAccount: () => {
    return get().accounts.find((a) => a.isPrimary);
  },
}));
