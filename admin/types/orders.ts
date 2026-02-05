export type OrderType = 'buy' | 'quick_sell' | 'smart_sell';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'settled' | 'cancelled' | 'failed';
export type KycStatus = 'pending' | 'approved' | 'rejected';

export interface AdminOrderDto {
  id: string;
  user_id: string;
  user_sui_address: string;
  user_kyc_status: KycStatus;
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
  // Transaction info (deposit/payment)
  tx_hash: string | null;
  tx_status: string | null;
}

export interface AdminOrdersResponse {
  orders: AdminOrderDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  order_type?: OrderType;
  status?: OrderStatus;
  needs_manual_review?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  reason?: string;
}
