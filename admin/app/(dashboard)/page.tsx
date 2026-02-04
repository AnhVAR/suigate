'use client';

import { useState, useEffect } from 'react';
import { DateRangeSelector } from '../../components/analytics/date-range-selector';
import { SummaryCards } from '../../components/analytics/summary-cards';
import { VolumeChart } from '../../components/analytics/volume-chart';
import { RevenueChart } from '../../components/analytics/revenue-chart';
import { UserGrowthChart } from '../../components/analytics/user-growth-chart';
import { KycDistributionChart } from '../../components/analytics/kyc-distribution-chart';
import { OrderBreakdownChart } from '../../components/analytics/order-breakdown-chart';
import {
  useAnalyticsSummary,
  useVolumeData,
  useRevenueData,
  useUserGrowth,
  useKycDistribution,
  useOrderBreakdown,
} from '../../hooks/use-analytics';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  });

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Auto-adjust period based on date range
  useEffect(() => {
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 14) {
      setPeriod('daily');
    } else if (daysDiff <= 60) {
      setPeriod('weekly');
    } else {
      setPeriod('monthly');
    }
  }, [dateRange]);

  // Fetch all analytics data
  const summaryQuery = useAnalyticsSummary(dateRange);
  const volumeQuery = useVolumeData({ ...dateRange, period });
  const revenueQuery = useRevenueData({ ...dateRange, period });
  const userGrowthQuery = useUserGrowth({ ...dateRange, period });
  const kycQuery = useKycDistribution();
  const orderBreakdownQuery = useOrderBreakdown(dateRange);

  const handleDateRangeChange = (from: string, to: string) => {
    setDateRange({ from, to });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Analytics Overview</h3>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your platform performance and key metrics (auto-refreshes every 30s)
        </p>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector onDateRangeChange={handleDateRangeChange} />

      {/* Summary Cards */}
      <SummaryCards data={summaryQuery.data} isLoading={summaryQuery.isLoading} />

      {/* Charts Row 1: Volume and Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VolumeChart data={volumeQuery.data} isLoading={volumeQuery.isLoading} />
        <RevenueChart data={revenueQuery.data} isLoading={revenueQuery.isLoading} />
      </div>

      {/* Charts Row 2: User Growth, KYC, Order Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserGrowthChart data={userGrowthQuery.data} isLoading={userGrowthQuery.isLoading} />
        <KycDistributionChart data={kycQuery.data} isLoading={kycQuery.isLoading} />
        <OrderBreakdownChart data={orderBreakdownQuery.data} isLoading={orderBreakdownQuery.isLoading} />
      </div>

      {/* Error Handling */}
      {(summaryQuery.error || volumeQuery.error || revenueQuery.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-800">Failed to load analytics data</h4>
          <p className="mt-1 text-sm text-red-700">
            {summaryQuery.error?.message || volumeQuery.error?.message || 'An error occurred'}
          </p>
        </div>
      )}
    </div>
  );
}
