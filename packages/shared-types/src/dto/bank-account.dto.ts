/** Create bank account request */
export interface CreateBankAccountDto {
  accountNumber: string;
  bankCode: string;
  accountHolder: string;
  isPrimary?: boolean;
}

/** Bank account response (account number masked) */
export interface BankAccountDto {
  id: number;
  accountNumber: string;
  bankCode: string;
  accountHolder: string;
  isPrimary: boolean;
  createdAt: string;
}

/** Bank account list response */
export interface BankAccountListDto {
  accounts: BankAccountDto[];
  total: number;
}
