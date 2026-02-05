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
