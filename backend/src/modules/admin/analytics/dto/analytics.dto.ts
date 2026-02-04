import { IsString, IsOptional, IsIn } from 'class-validator';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly'])
  period?: 'daily' | 'weekly' | 'monthly';
}

export interface AnalyticsSummary {
  total_volume_usdc: number;
  total_revenue_usdc: number;
  active_users: number;
  total_users: number;
  pending_orders: number;
  needs_review_orders: number;
}

export interface VolumeDataPoint {
  date: string;
  buy_volume: number;
  sell_volume: number;
  total_volume: number;
}

export interface RevenueDataPoint {
  date: string;
  buy_fees: number;
  sell_fees: number;
  total_fees: number;
}

export interface UserGrowthDataPoint {
  date: string;
  new_users: number;
  cumulative_users: number;
}

export interface KycDistribution {
  pending: number;
  approved: number;
  rejected: number;
}

export interface StatusCounts {
  pending: number;
  paid: number;
  processing: number;
  settled: number;
  cancelled: number;
  failed: number;
}

export interface OrderBreakdown {
  buy: StatusCounts;
  quick_sell: StatusCounts;
  smart_sell: StatusCounts;
}
