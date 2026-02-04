import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../lib/api/analytics-api';
import type { AnalyticsQueryParams } from '../types/analytics';

export function useAnalyticsSummary(params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ['analytics', 'summary', params],
    queryFn: () => analyticsApi.getSummary(params),
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
  });
}

export function useVolumeData(params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ['analytics', 'volume', params],
    queryFn: () => analyticsApi.getVolume(params),
    refetchInterval: 30_000,
  });
}

export function useRevenueData(params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ['analytics', 'revenue', params],
    queryFn: () => analyticsApi.getRevenue(params),
    refetchInterval: 30_000,
  });
}

export function useUserGrowth(params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ['analytics', 'users', params],
    queryFn: () => analyticsApi.getUserGrowth(params),
    refetchInterval: 30_000,
  });
}

export function useKycDistribution() {
  return useQuery({
    queryKey: ['analytics', 'kyc-distribution'],
    queryFn: () => analyticsApi.getKycDistribution(),
    refetchInterval: 30_000,
  });
}

export function useOrderBreakdown(params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ['analytics', 'order-breakdown', params],
    queryFn: () => analyticsApi.getOrderBreakdown(params),
    refetchInterval: 30_000,
  });
}
