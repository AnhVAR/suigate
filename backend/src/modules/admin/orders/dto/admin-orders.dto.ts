import {
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import type { OrderType, OrderStatus } from '../../../../common/supabase/database.types';

export class AdminOrdersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @IsEnum(['buy', 'quick_sell', 'smart_sell'])
  order_type?: OrderType;

  @IsOptional()
  @IsEnum(['pending', 'paid', 'processing', 'settled', 'cancelled', 'failed'])
  status?: OrderStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  needs_manual_review?: boolean;

  @IsOptional()
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'paid', 'processing', 'settled', 'cancelled', 'failed'])
  status: OrderStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export interface AdminOrderDto {
  id: string;
  user_id: string;
  user_sui_address: string;
  user_kyc_status: 'pending' | 'approved' | 'rejected';
  bank_account_id: number | null;
  bank_code: string | null;
  order_type: OrderType;
  amount_vnd: number | null;
  amount_usdc: number | null;
  rate: number;
  target_rate: number | null;
  status: OrderStatus;
  escrow_object_id: string | null;
  sepay_reference: string | null;
  needs_manual_review: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminOrdersResponse {
  orders: AdminOrderDto[];
  total: number;
  page: number;
  totalPages: number;
}
