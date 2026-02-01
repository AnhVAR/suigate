/** Current exchange rates response */
export interface RatesResponseDto {
  midRate: number;
  buyRate: number;
  sellRate: number;
  spreadBps: number;
  source: string;
  updatedAt: string;
}

/** Historical rates response */
export interface RateHistoryDto {
  rates: RatesResponseDto[];
  period: string;
}
