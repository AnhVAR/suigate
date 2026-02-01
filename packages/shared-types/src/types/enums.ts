/** KYC verification status */
export type KycStatus = 'pending' | 'approved' | 'rejected';

/** Order types supported by SuiGate */
export type OrderType = 'buy' | 'quick_sell' | 'smart_sell';

/** Order lifecycle status */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'settled'
  | 'cancelled'
  | 'failed';

/** OAuth provider for zkLogin */
export type AuthProvider = 'google' | 'apple';

/** Bank transfer direction */
export type TransferType = 'in' | 'out';
