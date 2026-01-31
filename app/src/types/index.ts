// User types
export interface User {
  id: string;
  suiAddress: string;
  email?: string;
  createdAt: Date;
}

// Bank account types
export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isVerified: boolean;
}

// Order types
export enum OrderType {
  OFFRAMP = 'OFFRAMP',
  ONRAMP = 'ONRAMP'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  userId: string;
  type: OrderType;
  amount: number;
  currency: string;
  status: OrderStatus;
  bankAccountId?: string;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}
