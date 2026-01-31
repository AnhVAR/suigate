// App configuration constants
export const APP_CONFIG = {
  APP_NAME: 'SuiGate',
  APP_SCHEME: 'suigate',
  VERSION: '1.0.0',
};

// API endpoints (will be configured later with actual backend)
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
};

// Sui network configuration
export const SUI_CONFIG = {
  NETWORK: process.env.EXPO_PUBLIC_SUI_NETWORK || 'testnet',
  RPC_URL: process.env.EXPO_PUBLIC_SUI_RPC_URL || 'https://fullnode.testnet.sui.io',
};

// USDC configuration
export const USDC_CONFIG = {
  DECIMALS: 6,
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 10000,
};
