/**
 * Secure Token Storage
 * Encrypted token storage using expo-secure-store
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'suigate_access_token';
const REFRESH_TOKEN_KEY = 'suigate_refresh_token';

// SecureStore is only available on iOS and Android
const isSecureStoreAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Get access token from secure storage
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } else {
      // Fallback to AsyncStorage for web development
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Set access token in secure storage
 */
export const setAccessToken = async (token: string): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } else {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error setting access token:', error);
    throw error;
  }
};

/**
 * Remove access token from secure storage
 */
export const removeAccessToken = async (): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    } else {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error removing access token:', error);
  }
};

/**
 * Get refresh token from secure storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } else {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Set refresh token in secure storage
 */
export const setRefreshToken = async (token: string): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error setting refresh token:', error);
    throw error;
  }
};

/**
 * Remove refresh token from secure storage
 */
export const removeRefreshToken = async (): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } else {
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error removing refresh token:', error);
  }
};

/**
 * Clear all tokens
 */
export const clearAllTokens = async (): Promise<void> => {
  await removeAccessToken();
  await removeRefreshToken();
};
