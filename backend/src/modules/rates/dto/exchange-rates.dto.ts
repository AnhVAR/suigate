export class RatesResponseDto {
  midRate: number;
  buyRate: number; // User pays more to buy USDC
  sellRate: number; // User receives less when selling USDC
  spreadBps: number; // Spread in basis points
  source: string;
  updatedAt: string;
}

export class RateHistoryDto {
  rates: RatesResponseDto[];
  period: string;
}
