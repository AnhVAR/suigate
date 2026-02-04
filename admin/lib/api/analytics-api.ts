import { apiClient } from '../api-client';
import type {
  AnalyticsSummary,
  VolumeDataPoint,
  RevenueDataPoint,
  UserGrowthDataPoint,
  KycDistribution,
  OrderBreakdown,
  AnalyticsQueryParams,
} from '../../types/analytics';

export const analyticsApi = {
  getSummary: async (params: AnalyticsQueryParams): Promise<AnalyticsSummary> => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);

    const queryString = queryParams.toString();
    const endpoint = `/admin/analytics/summary${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<AnalyticsSummary>(endpoint);
  },

  getVolume: async (params: AnalyticsQueryParams): Promise<VolumeDataPoint[]> => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.period) queryParams.append('period', params.period);

    const queryString = queryParams.toString();
    const endpoint = `/admin/analytics/volume${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<VolumeDataPoint[]>(endpoint);
  },

  getRevenue: async (params: AnalyticsQueryParams): Promise<RevenueDataPoint[]> => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.period) queryParams.append('period', params.period);

    const queryString = queryParams.toString();
    const endpoint = `/admin/analytics/revenue${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<RevenueDataPoint[]>(endpoint);
  },

  getUserGrowth: async (params: AnalyticsQueryParams): Promise<UserGrowthDataPoint[]> => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.period) queryParams.append('period', params.period);

    const queryString = queryParams.toString();
    const endpoint = `/admin/analytics/users${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<UserGrowthDataPoint[]>(endpoint);
  },

  getKycDistribution: async (): Promise<KycDistribution> => {
    return apiClient.get<KycDistribution>('/admin/analytics/kyc-distribution');
  },

  getOrderBreakdown: async (params: AnalyticsQueryParams): Promise<OrderBreakdown> => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);

    const queryString = queryParams.toString();
    const endpoint = `/admin/analytics/order-breakdown${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<OrderBreakdown>(endpoint);
  },
};
