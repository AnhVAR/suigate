export type OrderType = 'buy' | 'quick_sell' | 'smart_sell';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'settled' | 'cancelled' | 'failed';

export interface Transaction {
  id: string;
  type: OrderType;
  amountUsdc: number;
  amountVnd: number;
  rate: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  // Smart Sell specific
  targetRate?: number;
  filledUsdc?: number;
  totalUsdc?: number;
}

export interface BankAccount {
  id: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isPrimary: boolean;
}
