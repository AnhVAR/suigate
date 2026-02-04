import {
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import type { OrderType, OrderStatus, KycStatus } from '../../../../common/supabase/database.types';

export class AdminUsersQueryDto {
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
  @IsEnum(['pending', 'approved', 'rejected'])
  kyc_status?: KycStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  location_verified?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_locked?: boolean;

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

export class UpdateKycDto {
  @IsEnum(['pending', 'approved', 'rejected'])
  kyc_status: KycStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class LockUserDto {
  @IsString()
  @MinLength(1)
  reason: string;
}

export interface BankAccountDto {
  id: number;
  user_id: string;
  bank_code: string;
  account_holder: string;
  is_primary: boolean;
  created_at: string;
}

export interface OrderDto {
  id: string;
  order_type: OrderType;
  amount_vnd: number | null;
  amount_usdc: number | null;
  rate: number;
  status: OrderStatus;
  created_at: string;
}

export interface AdminUserDto {
  id: string;
  sui_address: string;
  google_id: string | null;
  kyc_status: KycStatus;
  location_verified: boolean;
  is_locked: boolean;
  locked_at: string | null;
  lock_reason: string | null;
  order_count: number;
  total_volume_usdc: number;
  created_at: string;
}

export interface AdminUserDetailDto extends AdminUserDto {
  bank_accounts: BankAccountDto[];
  recent_orders: OrderDto[];
}

export interface AdminUsersResponse {
  users: AdminUserDto[];
  total: number;
  page: number;
  totalPages: number;
}
