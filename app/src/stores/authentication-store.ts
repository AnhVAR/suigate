import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setAccessToken,
  clearAllTokens,
  getAccessToken,
} from '../api/secure-token-storage';
import { userProfileAndKycApiService } from '../api/user-profile-and-kyc-api-service';
import type { KycStatus as BackendKycStatus } from '@suigate/shared-types';

type KycStatus = 'none' | 'pending' | 'verified' | 'rejected';
type LocationStatus = 'unknown' | 'granted' | 'denied' | 'within_sandbox' | 'outside_sandbox';

// Map local KYC status to backend status
const mapKycStatusToBackend = (status: KycStatus): BackendKycStatus => {
  if (status === 'none') return 'pending';
  if (status === 'verified') return 'approved';
  return status as BackendKycStatus;
};

// Map backend KYC status to local status
const mapKycStatusFromBackend = (status: BackendKycStatus): KycStatus => {
  if (status === 'approved') return 'verified';
  return status as KycStatus;
};

interface AuthState {
  // Auth
  isAuthenticated: boolean;
  suiAddress: string | null;
  email: string | null;
  userId: string | null;
  isLoading: boolean;

  // KYC
  kycStatus: KycStatus;

  // Location
  locationStatus: LocationStatus;
  lastLocationCheck: number | null;

  // Actions
  login: (suiAddress: string, email?: string) => Promise<void>;
  loginWithBackend: (data: {
    accessToken: string;
    userId: string;
    suiAddress: string;
    email?: string;
    isNewUser?: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchProfile: () => Promise<void>;
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
  userId: null,
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

  loginWithBackend: async (data) => {
    // Store JWT token securely
    await setAccessToken(data.accessToken);

    // Store auth data
    const authData = {
      userId: data.userId,
      suiAddress: data.suiAddress,
      email: data.email,
      kycStatus: 'none' as KycStatus,
      locationStatus: 'unknown' as LocationStatus,
    };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    set({
      isAuthenticated: true,
      userId: data.userId,
      suiAddress: data.suiAddress,
      email: data.email || null,
      kycStatus: 'none',
      locationStatus: 'unknown',
    });

    // Fetch user profile to get KYC/location status
    try {
      await get().fetchProfile();
    } catch (error) {
      console.error('Failed to fetch profile after login:', error);
    }
  },

  fetchProfile: async () => {
    try {
      const profile = await userProfileAndKycApiService.getProfile();

      // Map backend KYC status to local type
      const kycStatus = mapKycStatusFromBackend(profile.kycStatus);

      // Map backend location to local type
      const locationStatus: LocationStatus = profile.locationVerified
        ? 'within_sandbox'
        : 'unknown';

      // Update local state
      set({
        kycStatus,
        locationStatus,
      });

      // Update AsyncStorage
      const current = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (current) {
        const data = JSON.parse(current);
        data.kycStatus = kycStatus;
        data.locationStatus = locationStatus;
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      throw error;
    }
  },

  logout: async () => {
    // Clear tokens
    await clearAllTokens();

    // Clear auth data
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

    set({
      isAuthenticated: false,
      suiAddress: null,
      email: null,
      userId: null,
      kycStatus: 'none',
      locationStatus: 'unknown',
      lastLocationCheck: null,
    });
  },

  checkAuth: async () => {
    try {
      // Check if token exists
      const token = await getAccessToken();
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      // Get stored auth data
      const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        const { userId, suiAddress, email, kycStatus, locationStatus } = JSON.parse(authData);
        set({
          isAuthenticated: true,
          userId: userId || null,
          suiAddress,
          email: email || null,
          kycStatus: kycStatus || 'none',
          locationStatus: locationStatus || 'unknown',
          isLoading: false,
        });

        // TODO: Validate token with backend /users/me endpoint
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Check auth error:', error);
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  setKycStatus: async (status: KycStatus) => {
    try {
      // Map local status to backend
      const backendStatus = mapKycStatusToBackend(status);

      // Update on backend
      await userProfileAndKycApiService.updateKyc({ status: backendStatus });

      // Update local state
      const current = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (current) {
        const data = JSON.parse(current);
        data.kycStatus = status;
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      }
      set({ kycStatus: status });
    } catch (error) {
      console.error('Update KYC status error:', error);
      throw error;
    }
  },

  setLocationStatus: async (status: LocationStatus) => {
    try {
      // Map local status to backend boolean
      const verified = status === 'within_sandbox';

      // Update on backend
      await userProfileAndKycApiService.updateLocation({ verified });

      // Update local state
      const current = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (current) {
        const data = JSON.parse(current);
        data.locationStatus = status;
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      }
      set({ locationStatus: status, lastLocationCheck: Date.now() });
    } catch (error) {
      console.error('Update location status error:', error);
      throw error;
    }
  },

  canAccessVndFeatures: () => {
    const { kycStatus, locationStatus } = get();
    return kycStatus === 'verified' && locationStatus === 'within_sandbox';
  },
}));
