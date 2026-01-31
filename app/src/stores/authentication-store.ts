import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type KycStatus = 'none' | 'pending' | 'verified' | 'rejected';
type LocationStatus = 'unknown' | 'granted' | 'denied' | 'within_sandbox' | 'outside_sandbox';

interface AuthState {
  // Auth
  isAuthenticated: boolean;
  suiAddress: string | null;
  email: string | null;
  isLoading: boolean;

  // KYC
  kycStatus: KycStatus;

  // Location
  locationStatus: LocationStatus;
  lastLocationCheck: number | null;

  // Actions
  login: (suiAddress: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setKycStatus: (status: KycStatus) => Promise<void>;
  setLocationStatus: (status: LocationStatus) => Promise<void>;

  // Computed
  canAccessVndFeatures: () => boolean;
}

const AUTH_STORAGE_KEY = '@suigate:auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  suiAddress: null,
  email: null,
  isLoading: true,
  kycStatus: 'none',
  locationStatus: 'unknown',
  lastLocationCheck: null,

  login: async (suiAddress: string, email?: string) => {
    const data = {
      suiAddress,
      email,
      kycStatus: 'none' as KycStatus,
      locationStatus: 'unknown' as LocationStatus,
    };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    set({
      isAuthenticated: true,
      suiAddress,
      email: email || null,
      kycStatus: 'none',
      locationStatus: 'unknown',
    });
  },

  logout: async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    set({
      isAuthenticated: false,
      suiAddress: null,
      email: null,
      kycStatus: 'none',
      locationStatus: 'unknown',
      lastLocationCheck: null,
    });
  },

  checkAuth: async () => {
    try {
      const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        const { suiAddress, email, kycStatus, locationStatus } = JSON.parse(authData);
        set({
          isAuthenticated: true,
          suiAddress,
          email: email || null,
          kycStatus: kycStatus || 'none',
          locationStatus: locationStatus || 'unknown',
          isLoading: false,
        });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Check auth error:', error);
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  setKycStatus: async (status: KycStatus) => {
    const current = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (current) {
      const data = JSON.parse(current);
      data.kycStatus = status;
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    }
    set({ kycStatus: status });
  },

  setLocationStatus: async (status: LocationStatus) => {
    const current = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (current) {
      const data = JSON.parse(current);
      data.locationStatus = status;
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    }
    set({ locationStatus: status, lastLocationCheck: Date.now() });
  },

  canAccessVndFeatures: () => {
    const { kycStatus, locationStatus } = get();
    return kycStatus === 'verified' && locationStatus === 'within_sandbox';
  },
}));
