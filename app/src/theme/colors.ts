/**
 * SuiGate Color Palette
 * Fintech-style: neutral purple primary, semantic green/red
 */
export const colors = {
  // Primary - Sui-inspired purple/blue
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6', // Main primary
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Semantic - Transaction types
  semantic: {
    buy: '#10b981', // Green - receiving/buying
    buyLight: '#d1fae5',
    sell: '#ef4444', // Red - selling/sending
    sellLight: '#fee2e2',
  },

  // Status
  status: {
    success: '#22c55e',
    successLight: '#dcfce7',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#3b82f6',
    infoLight: '#dbeafe',
  },

  // Neutrals - UI backgrounds/text
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Background
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
  },

  // Text
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
  },

  // Border
  border: {
    light: '#e5e7eb',
    default: '#d1d5db',
    dark: '#9ca3af',
  },
} as const;

export type ColorKey = keyof typeof colors;
