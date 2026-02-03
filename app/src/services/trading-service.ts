/**
 * Trading Service
 * Handles order creation, rate fetching, and VietQR generation
 * Uses real backend API for order creation
 */

import { ordersBuySellApiService } from '../api/orders-buy-sell-api-service';
import { exchangeRatesApiService } from '../api/exchange-rates-api-service';

const FALLBACK_RATE = 25000; // VND per USDC (fallback when API fails)
const BUY_FEE = 0.005; // 0.5%
const QUICK_SELL_FEE = 0.005; // 0.5%
const SMART_SELL_FEE = 0.002; // 0.2%

export interface CreateBuyOrderResult {
  orderId: string;
  amountVnd: number;
  amountUsdc: number;
  rate: number;
  qrData: string; // QR content for local generation
  reference: string;
  expiresAt: Date;
}

export interface CreateSellOrderResult {
  orderId: string;
  amountUsdc: number;
  amountVnd: number;
  rate: number;
  fee: number;
}

export interface SmartSellComparison {
  quickSellVnd: number;
  smartSellVnd: number;
  savings: number;
}

/**
 * Fetch current VND/USDC rate from backend API
 * Falls back to cached or default rate on error
 */
let cachedRate: number | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 60 seconds

export const getCurrentRate = async (): Promise<number> => {
  try {
    // Use cache if fresh
    const now = Date.now();
    if (cachedRate && now - lastFetchTime < CACHE_TTL) {
      return cachedRate;
    }

    // Fetch from real API
    const rates = await exchangeRatesApiService.getCurrentRates();
    cachedRate = rates.buyRate; // Use buyRate for user-facing display
    lastFetchTime = now;

    return cachedRate;
  } catch (error) {
    console.error('Failed to fetch current rate:', error);

    // Return cached rate if available
    if (cachedRate) {
      console.warn('Using cached rate due to API error');
      return cachedRate;
    }

    // Final fallback to default rate
    console.warn('Using fallback rate');
    return FALLBACK_RATE;
  }
};

/**
 * Create a buy USDC order with VietQR payment
 * Calls real backend API to create order in database
 */
export const createBuyOrder = async (
  amountVnd: number
): Promise<CreateBuyOrderResult> => {
  try {
    // Call real backend API
    const response = await ordersBuySellApiService.createBuyOrder({ amountVnd });

    // QR data format for VietQR (simplified for local generation)
    const qrData = JSON.stringify({
      bank: 'MB',
      account: '0123456789',
      amount: amountVnd,
      reference: response.reference,
      message: `SuiGate ${response.reference}`,
    });

    return {
      orderId: response.orderId,
      amountVnd: response.amountVnd,
      amountUsdc: parseFloat(response.amountUsdc),
      rate: response.rate,
      qrData: response.qrCode || qrData,
      reference: response.reference,
      expiresAt: new Date(response.expiresAt),
    };
  } catch (error) {
    console.error('Failed to create buy order via API:', error);
    throw error;
  }
};

/**
 * Create a quick sell order (instant at market rate)
 */
export const createQuickSellOrder = async (
  amountUsdc: number,
  bankAccountId: number
): Promise<CreateSellOrderResult> => {
  await new Promise((r) => setTimeout(r, 800));

  const rate = await getCurrentRate();
  const grossVnd = amountUsdc * rate;
  const fee = grossVnd * QUICK_SELL_FEE;
  const netVnd = grossVnd - fee;

  return {
    orderId: `order-${Date.now()}`,
    amountUsdc,
    amountVnd: Math.round(netVnd),
    rate,
    fee,
  };
};

/**
 * Create a smart sell order (escrow at target rate)
 */
export const createSmartSellOrder = async (
  amountUsdc: number,
  targetRate: number,
  bankAccountId: number
): Promise<CreateSellOrderResult & { comparison: SmartSellComparison }> => {
  await new Promise((r) => setTimeout(r, 800));

  const currentRate = await getCurrentRate();

  // Quick sell calculation
  const quickSellGross = amountUsdc * currentRate;
  const quickSellFee = quickSellGross * QUICK_SELL_FEE;
  const quickSellVnd = quickSellGross - quickSellFee;

  // Smart sell calculation (at target rate)
  const smartSellGross = amountUsdc * targetRate;
  const smartSellFee = smartSellGross * SMART_SELL_FEE;
  const smartSellVnd = smartSellGross - smartSellFee;

  return {
    orderId: `order-${Date.now()}`,
    amountUsdc,
    amountVnd: Math.round(smartSellVnd),
    rate: targetRate,
    fee: smartSellFee,
    comparison: {
      quickSellVnd: Math.round(quickSellVnd),
      smartSellVnd: Math.round(smartSellVnd),
      savings: Math.round(smartSellVnd - quickSellVnd),
    },
  };
};

/**
 * Validate target rate is within ±10% of current rate
 */
export const validateTargetRate = (
  targetRate: number,
  currentRate: number
): { valid: boolean; error?: string } => {
  const minRate = currentRate * 0.9;
  const maxRate = currentRate * 1.1;

  if (targetRate < minRate) {
    return { valid: false, error: 'Target rate too low (max -10%)' };
  }
  if (targetRate > maxRate) {
    return { valid: false, error: 'Target rate too high (max +10%)' };
  }
  return { valid: true };
};

/**
 * Format VND amount with thousands separator
 */
export const formatVnd = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

/**
 * Format USDC amount with 2 decimal places
 */
export const formatUsdc = (amount: number): string => {
  return amount.toFixed(2);
};
