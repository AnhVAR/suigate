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

export interface DepositPayload {
  orderId: string;
  poolObjectId: string;
  packageId: string;
  usdcType: string;
  amountMist: string;
}

export interface EscrowPayload {
  orderId: string;
  amountMist: string;
  targetRate: number;
  bankAccountId: number;
}

export interface CreateSellOrderResult {
  orderId: string;
  amountUsdc: number;
  amountVnd: number;
  rate: number;
  fee: number;
  depositPayload?: DepositPayload;
  escrowPayload?: EscrowPayload;
}

export interface SmartSellComparison {
  quickSellVnd: number;
  smartSellVnd: number;
  savings: number;
}

export interface ExchangeRates {
  buyRate: number;
  sellRate: number;
  midRate: number;
}

/** Fetch current rates from backend API with caching */
let cachedRates: ExchangeRates | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 60 seconds

export const getExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    const now = Date.now();
    if (cachedRates && now - lastFetchTime < CACHE_TTL) {
      return cachedRates;
    }

    const rates = await exchangeRatesApiService.getCurrentRates();
    cachedRates = {
      buyRate: rates.buyRate,
      sellRate: rates.sellRate,
      midRate: rates.midRate,
    };
    lastFetchTime = now;
    return cachedRates;
  } catch (error) {
    console.error('Failed to fetch rates:', error);
    if (cachedRates) return cachedRates;

    return {
      buyRate: FALLBACK_RATE * 1.005,
      sellRate: FALLBACK_RATE * 0.995,
      midRate: FALLBACK_RATE,
    };
  }
};

/** Backward-compat: returns sellRate (used in convert screen for sell modes) */
export const getCurrentRate = async (): Promise<number> => {
  const rates = await getExchangeRates();
  return rates.sellRate;
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
 * Calls real backend API
 */
export const createQuickSellOrder = async (
  amountUsdc: number,
  bankAccountId: number
): Promise<CreateSellOrderResult> => {
  const response = await ordersBuySellApiService.createQuickSellOrder({
    amountUsdc: amountUsdc.toString(),
    bankAccountId,
  });

  return {
    orderId: response.orderId,
    amountUsdc: parseFloat(response.amountUsdc),
    amountVnd: response.amountVnd,
    rate: response.rate,
    fee: response.amountVnd * QUICK_SELL_FEE,
    depositPayload: response.depositPayload,
  };
};

/**
 * Create a smart sell order (escrow at target rate)
 * Calls real backend API
 */
export const createSmartSellOrder = async (
  amountUsdc: number,
  targetRate: number,
  bankAccountId: number
): Promise<CreateSellOrderResult & { comparison: SmartSellComparison }> => {
  const response = await ordersBuySellApiService.createSmartSellOrder({
    amountUsdc: amountUsdc.toString(),
    targetRate,
    bankAccountId,
  });

  return {
    orderId: response.orderId,
    amountUsdc: parseFloat(response.amountUsdc),
    amountVnd: response.comparison.smartSellVnd,
    rate: response.targetRate,
    fee: parseFloat(response.fee),
    comparison: response.comparison,
    escrowPayload: response.escrowPayload,
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
