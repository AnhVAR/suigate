import { OrderType, OrderStatus } from '../types/enums';

/** Create buy order request */
export interface CreateBuyOrderDto {
  amountVnd: number;
}

/** Buy order response with VietQR */
export interface BuyOrderResponseDto {
  orderId: string;
  amountVnd: number;
  amountUsdc: string;
  rate: number;
  qrCode: string;
  reference: string;
  expiresAt: string;
}

/** Create quick sell order request */
export interface CreateQuickSellOrderDto {
  amountUsdc: string;
  bankAccountId: number;
}

/** Quick sell order response */
export interface QuickSellOrderResponseDto {
  orderId: string;
  amountUsdc: string;
  amountVnd: number;
  rate: number;
  bankAccountId: number;
  status: string;
  /** Transaction payload for user to deposit USDC to pool */
  depositPayload: {
    orderId: string;
    poolObjectId: string;
    packageId: string;
    usdcType: string;
    amountMist: string; // USDC amount in smallest unit (6 decimals)
  };
}

/** Create smart sell order request */
export interface CreateSmartSellOrderDto {
  amountUsdc: string;
  targetRate: number;
  bankAccountId: number;
}

/** Smart sell order response with comparison */
export interface SmartSellOrderResponseDto {
  orderId: string;
  amountUsdc: string;
  targetRate: number;
  currentRate: number;
  fee: string;
  comparison: {
    quickSellVnd: number;
    smartSellVnd: number;
    savings: number;
  };
}

/** Confirm order with blockchain tx */
export interface ConfirmOrderDto {
  txHash: string;
}

/** Set escrow object ID */
export interface SetEscrowDto {
  escrowObjectId: string;
}

/** Order details */
export interface OrderDto {
  id: string;
  orderType: OrderType;
  amountVnd: number | null;
  amountUsdc: string | null;
  rate: number;
  targetRate: number | null;
  status: OrderStatus | string;
  sepayReference: string | null;
  escrowObjectId: string | null;
  createdAt: string;
  expiresAt: string | null;
}

/** Order list response */
export interface OrderListResponseDto {
  orders: OrderDto[];
  total: number;
}

/** Cancel payload returned to frontend for user signing */
export interface CancelPayloadDto {
  orderId: string;
  escrowObjectId?: string;
  remainingUsdc: number;
  filledUsdc: number;
  pendingVnd: number;
  packageId?: string;
  txPayload?: string; // null if fully filled (DB-only cancel)
}

/** Cancel order request */
export interface CancelOrderDto {
  txHash?: string; // Required if remainingUsdc > 0
}

/** Cancel order response */
export interface CancelOrderResponseDto {
  orderId: string;
  status: string;
  filledUsdc: number;
  refundedUsdc: number;
  pendingVnd: number;
}

/** Fill history item for display */
export interface FillHistoryItem {
  amountUsdc: number;
  rate: number;
  amountVnd: number;
  vndSettled: boolean;
  matchedAt: string;
}

/** Smart sell order with fill tracking (extended OrderDto) */
export interface SmartSellOrderDto extends OrderDto {
  filledUsdc: number;
  remainingUsdc: number;
  fillHistory: FillHistoryItem[];
}
