/**
 * Trading Service
 * Handles order creation, rate fetching, and VietQR generation (mock)
 */

const MOCK_RATE = 25000; // VND per USDC
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
 * Fetch current VND/USDC rate (mock with small variation)
 */
export const getCurrentRate = async (): Promise<number> => {
  await new Promise((r) => setTimeout(r, 300));
  // Add small random variation for realism
  return MOCK_RATE + Math.floor(Math.random() * 200 - 100);
};

/**
 * Create a buy USDC order with VietQR payment
 */
export const createBuyOrder = async (
  amountVnd: number
): Promise<CreateBuyOrderResult> => {
  await new Promise((r) => setTimeout(r, 800));

  const rate = await getCurrentRate();
  const fee = amountVnd * BUY_FEE;
  const netVnd = amountVnd - fee;
  const amountUsdc = netVnd / rate;

  const reference = `SG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // QR data format for VietQR (simplified for local generation)
  const qrData = JSON.stringify({
    bank: 'VCB',
    account: '0123456789',
    amount: amountVnd,
    reference,
    message: `SuiGate ${reference}`,
  });

  return {
    orderId: `order-${Date.now()}`,
    amountVnd,
    amountUsdc: Math.round(amountUsdc * 100) / 100,
    rate,
    qrData,
    reference,
    expiresAt,
  };
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
