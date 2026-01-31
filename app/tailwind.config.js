/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary palette - Sui-inspired purple
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Semantic - Transaction types
        buy: '#10b981',
        'buy-light': '#d1fae5',
        sell: '#ef4444',
        'sell-light': '#fee2e2',
        // Status
        success: '#22c55e',
        'success-light': '#dcfce7',
        warning: '#f59e0b',
        'warning-light': '#fef3c7',
        error: '#ef4444',
        'error-light': '#fee2e2',
        info: '#3b82f6',
        'info-light': '#dbeafe',
      },
      fontSize: {
        balance: ['48px', { lineHeight: '1.1', fontWeight: '700' }],
        'balance-sm': ['36px', { lineHeight: '1.1', fontWeight: '700' }],
      },
      spacing: {
        screen: '20px',
        card: '16px',
      },
      borderRadius: {
        card: '12px',
        button: '12px',
        input: '12px',
      },
    },
  },
  plugins: [],
};
