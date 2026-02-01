/**
 * zkLogin Service
 * MVP: Simulated OAuth flow + Backend integration
 * Production: Sui zkLogin with real OAuth
 */

import * as WebBrowser from 'expo-web-browser';
import { authZkLoginApiService } from '../api/auth-zklogin-api-service';
import { USE_MOCK_AUTH } from '../config/api-base-configuration';
import type { ZkLoginResponseDto } from '@suigate/shared-types';

// For MVP demo - generates deterministic address from email
const generateMockSuiAddress = (email: string): string => {
  // Simple hash-like generation for demo
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(64, '0');
  return `0x${hex.slice(0, 64)}`;
};

// Mock salt for demo
const generateMockSalt = (): string => {
  return Math.random().toString(36).substring(7);
};

export interface ZkLoginResult {
  success: boolean;
  suiAddress?: string;
  email?: string;
  accessToken?: string;
  userId?: string;
  isNewUser?: boolean;
  error?: string;
}

// MVP: Mock Google login with backend integration
export const loginWithGoogle = async (): Promise<ZkLoginResult> => {
  try {
    // For hackathon demo: simulate OAuth delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock successful OAuth
    const mockEmail = 'demo@example.com';
    const suiAddress = generateMockSuiAddress(mockEmail);
    const mockJwt = 'mock_google_jwt_token';
    const mockSalt = generateMockSalt();

    // Call backend to authenticate
    const backendResponse = await authZkLoginApiService.zkLogin({
      jwt: mockJwt,
      suiAddress,
      salt: mockSalt,
      provider: 'google',
    });

    return {
      success: true,
      suiAddress,
      email: mockEmail,
      accessToken: backendResponse.accessToken,
      userId: backendResponse.userId,
      isNewUser: backendResponse.isNewUser,
    };
  } catch (error) {
    console.error('Google login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
};

// MVP: Mock Apple login with backend integration
export const loginWithApple = async (): Promise<ZkLoginResult> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockEmail = 'demo.apple@icloud.com';
    const suiAddress = generateMockSuiAddress(mockEmail);
    const mockJwt = 'mock_apple_jwt_token';
    const mockSalt = generateMockSalt();

    // Call backend to authenticate
    const backendResponse = await authZkLoginApiService.zkLogin({
      jwt: mockJwt,
      suiAddress,
      salt: mockSalt,
      provider: 'apple',
    });

    return {
      success: true,
      suiAddress,
      email: mockEmail,
      accessToken: backendResponse.accessToken,
      userId: backendResponse.userId,
      isNewUser: backendResponse.isNewUser,
    };
  } catch (error) {
    console.error('Apple login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
};
