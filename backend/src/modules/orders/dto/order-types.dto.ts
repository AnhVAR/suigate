import { IsNumber, IsString, IsPositive, Min, Max } from 'class-validator';

// Buy Order
export class CreateBuyOrderDto {
  @IsNumber()
  @IsPositive()
  @Min(100000)
  @Max(50000000)
  amountVnd: number;
}

export class BuyOrderResponseDto {
  orderId: string;
  amountVnd: number;
  amountUsdc: string;
  rate: number;
  qrCode: string; // VietQR URL
  reference: string; // SG-XXXX reference
  expiresAt: string;
}

// Quick Sell Order
export class CreateQuickSellOrderDto {
  @IsString()
  amountUsdc: string;

  @IsNumber()
  bankAccountId: number;
}

export class QuickSellOrderResponseDto {
  orderId: string;
  amountUsdc: string;
  amountVnd: number;
  rate: number;
  bankAccountId: number;
  status: string;
  depositPayload: {
    orderId: string;
    poolObjectId: string;
    packageId: string;
    usdcType: string;
    amountMist: string;
  };
}

// Smart Sell Order
export class CreateSmartSellOrderDto {
  @IsString()
  amountUsdc: string;

  @IsNumber()
  targetRate: number;

  @IsNumber()
  bankAccountId: number;
}

export class SmartSellOrderResponseDto {
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

// Order Confirmation
export class ConfirmOrderDto {
  @IsString()
  txHash: string;
}

// Order List
export class OrderDto {
  id: string;
  orderType: 'buy' | 'quick_sell' | 'smart_sell';
  amountVnd: number | null;
  amountUsdc: string | null;
  rate: number;
  targetRate: number | null;
  status: string;
  sepayReference: string | null;
  escrowObjectId: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export class OrderListResponseDto {
  orders: OrderDto[];
  total: number;
}
