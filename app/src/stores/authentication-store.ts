import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  suiAddress: string | null;
  isLoading: boolean;
  login: (suiAddress: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AUTH_STORAGE_KEY = '@suigate:auth';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  suiAddress: null,
  isLoading: true,

  login: async (suiAddress: string) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ suiAddress }));
      set({ isAuthenticated: true, suiAddress });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      set({ isAuthenticated: false, suiAddress: null });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        const { suiAddress } = JSON.parse(authData);
        set({ isAuthenticated: true, suiAddress, isLoading: false });
      } else {
        set({ isAuthenticated: false, suiAddress: null, isLoading: false });
      }
    } catch (error) {
      console.error('Check auth error:', error);
      set({ isAuthenticated: false, suiAddress: null, isLoading: false });
    }
  },
}));
