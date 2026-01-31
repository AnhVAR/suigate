export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type KycStatus = 'pending' | 'approved' | 'rejected';
export type OrderType = 'buy' | 'quick_sell' | 'smart_sell';
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'settled'
  | 'cancelled'
  | 'failed';
export type TxStatus = 'pending' | 'confirmed' | 'failed';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          google_id: string | null;
          apple_id: string | null;
          sui_address: string;
          kyc_status: KycStatus;
          location_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          google_id?: string | null;
          apple_id?: string | null;
          sui_address: string;
          kyc_status?: KycStatus;
          location_verified?: boolean;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      bank_accounts: {
        Row: {
          id: number;
          user_id: string;
          account_number_encrypted: string;
          bank_code: string;
          account_holder: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          account_number_encrypted: string;
          bank_code: string;
          account_holder: string;
          is_primary?: boolean;
        };
        Update: Partial<
          Database['public']['Tables']['bank_accounts']['Insert']
        >;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          bank_account_id: number | null;
          order_type: OrderType;
          amount_vnd: number | null;
          amount_usdc: number | null;
          rate: number;
          target_rate: number | null;
          status: OrderStatus;
          escrow_object_id: string | null;
          sepay_reference: string | null;
          sepay_transaction_id: string | null;
          needs_manual_review: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bank_account_id?: number | null;
          order_type: OrderType;
          amount_vnd?: number | null;
          amount_usdc?: number | null;
          rate: number;
          target_rate?: number | null;
          status?: OrderStatus;
          escrow_object_id?: string | null;
          sepay_reference?: string | null;
          sepay_transaction_id?: string | null;
          needs_manual_review?: boolean;
          expires_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      transactions: {
        Row: {
          id: number;
          order_id: string;
          tx_hash: string;
          tx_status: TxStatus;
          created_at: string;
        };
        Insert: {
          order_id: string;
          tx_hash: string;
          tx_status?: TxStatus;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      conversion_rates: {
        Row: {
          id: number;
          mid_rate: number;
          buy_rate: number;
          sell_rate: number;
          spread_bps: number;
          source: string;
          fetched_at: string;
        };
        Insert: {
          mid_rate: number;
          buy_rate: number;
          sell_rate: number;
          spread_bps: number;
          source: string;
        };
        Update: Partial<
          Database['public']['Tables']['conversion_rates']['Insert']
        >;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
