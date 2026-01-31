import i18n from '../i18n';

/**
 * Format a number as Vietnamese Dong (VND).
 * Uses Vietnamese locale formatting with thousands separators.
 */
export const formatVnd = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
};

/**
 * Format a number as USDC with specified decimal places.
 * Uses US locale formatting for consistency.
 */
export const formatUsdc = (amount: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Format amount with currency suffix (VND or USDC).
 */
export const formatCurrency = (
  amount: number,
  currency: 'VND' | 'USDC'
): string => {
  if (currency === 'VND') {
    return `${formatVnd(amount)} VND`;
  }
  return `${formatUsdc(amount)} USDC`;
};

/**
 * Format exchange rate as "1 USDC = X VND".
 */
export const formatRate = (rate: number): string => {
  return `1 USDC = ${formatVnd(rate)} VND`;
};

/**
 * Parse a formatted currency string back to number.
 * Removes thousands separators and parses.
 */
export const parseCurrencyInput = (input: string): number => {
  // Remove all non-numeric characters except decimal point
  const cleaned = input.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
};
