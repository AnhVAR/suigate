import type { KycStatus, OrderType, OrderStatus } from './database.types';

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

export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  kyc_status?: KycStatus;
  location_verified?: boolean;
  is_locked?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface UpdateKycDto {
  kyc_status: KycStatus;
  reason?: string;
}

export interface LockUserDto {
  reason: string;
}
