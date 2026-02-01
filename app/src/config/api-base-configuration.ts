/**
 * API Configuration
 * Centralized API settings for the application
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 to reach host machine's localhost
const getDefaultApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

// API Base URL - defaults based on platform
export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  getDefaultApiUrl();

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000;

// Maximum retry attempts for failed requests
export const MAX_RETRIES = 3;

// Token refresh queue
export const REFRESH_TOKEN_ENDPOINT = '/auth/refresh';

// Mock auth toggle (for development)
export const USE_MOCK_AUTH =
  process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';
