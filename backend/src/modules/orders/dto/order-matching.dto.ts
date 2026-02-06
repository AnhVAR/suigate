import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

/** Single smart sell fill in a match result */
export interface SmartSellFill {
  orderId: string;
  escrowObjectId: string;
  fillAmount: number; // USDC amount to fill from this escrow
  rate: number; // VND/USDC (seller's target_rate)
}

/** Result of matching engine calculation */
export interface MatchResult {
  smartSellFills: SmartSellFill[];
  poolFill: number; // Remaining USDC from pool
  totalVnd: number; // Total VND buyer pays
  matchedUsdc: number; // Total USDC from smart sells
}

/** Response DTO for match preview (not used in MVP per validation) */
export class MatchPreviewDto {
  smartSellCount: number;
  matchedUsdc: string;
  poolUsdc: string;
  totalVnd: number;
  averageRate: number;
}

/** Cancel payload returned to frontend for user signing */
export class CancelPayloadDto {
  @IsUUID()
  orderId: string;

  @IsString()
  @IsOptional()
  escrowObjectId?: string;

  @IsNumber()
  remainingUsdc: number;

  @IsNumber()
  filledUsdc: number;

  @IsNumber()
  pendingVnd: number; // VND waiting for settlement from filled portions

  @IsString()
  @IsOptional()
  packageId?: string;

  @IsString()
  @IsOptional()
  txPayload?: string; // Serialized PTB, null if fully filled
}

/** Cancel order request from frontend */
export class CancelOrderDto {
  @IsString()
  @IsOptional()
  txHash?: string; // Required if remainingUsdc > 0
}

/** Cancel order response */
export class CancelOrderResponseDto {
  orderId: string;
  status: string;
  filledUsdc: number;
  refundedUsdc: number;
  pendingVnd: number;
}

/** Order match record for tracking fills */
export interface OrderMatchRecord {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  amountUsdc: number;
  rate: number;
  amountVnd: number;
  txHash?: string;
  status: 'pending' | 'executed' | 'settled';
  vndSettled: boolean;
  createdAt: string;
}

/** Fill history item for display */
export interface FillHistoryItem {
  amountUsdc: number;
  rate: number;
  amountVnd: number;
  vndSettled: boolean;
  matchedAt: string;
}
