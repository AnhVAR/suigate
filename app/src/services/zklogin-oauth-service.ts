/**
 * zkLogin Service
 * MVP: Simulated OAuth flow
 * Production: Sui zkLogin with real OAuth
 */

import * as WebBrowser from 'expo-web-browser';

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

export interface ZkLoginResult {
  success: boolean;
  suiAddress?: string;
  email?: string;
  error?: string;
}

// MVP: Mock Google login
export const loginWithGoogle = async (): Promise<ZkLoginResult> => {
  try {
    // For hackathon demo: simulate OAuth delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock successful login
    const mockEmail = 'demo@example.com';
    const suiAddress = generateMockSuiAddress(mockEmail);

    return {
      success: true,
      suiAddress,
      email: mockEmail,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
};

// MVP: Mock Apple login
export const loginWithApple = async (): Promise<ZkLoginResult> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockEmail = 'demo.apple@icloud.com';
    const suiAddress = generateMockSuiAddress(mockEmail);

    return {
      success: true,
      suiAddress,
      email: mockEmail,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
};
