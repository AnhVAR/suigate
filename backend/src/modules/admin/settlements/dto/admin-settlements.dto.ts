import { IsOptional, IsString, IsNumber } from 'class-validator';

/** Pending settlement for VND disbursement */
export class PendingSettlementDto {
  matchId: string;
  sellOrderId: string;
  sellerUserId: string;
  sellerAddress: string;
  amountUsdc: number;
  rate: number;
  grossVnd: number;
  feeVnd: number;
  netVnd: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  matchedAt: string;
}

/** Settlement history record */
export class SettlementHistoryDto extends PendingSettlementDto {
  settledBy: string;
  settledAt: string;
}

/** Query params for settlement history */
export class SettlementHistoryQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 50;

  @IsOptional()
  @IsString()
  date_from?: string;

  @IsOptional()
  @IsString()
  date_to?: string;
}

/** Response for settlement list */
export class SettlementsListResponseDto {
  settlements: PendingSettlementDto[] | SettlementHistoryDto[];
  total: number;
  page: number;
  totalPages: number;
}

/** Settle match request */
export class SettleMatchDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

/** Settle match response */
export class SettleMatchResponseDto {
  success: boolean;
  matchId: string;
  netVnd: number;
  settledAt: string;
}
