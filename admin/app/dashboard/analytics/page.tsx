'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { SummaryCards } from '../../../components/analytics/summary-cards';
import { VolumeChart } from '../../../components/analytics/volume-chart';
import { RevenueChart } from '../../../components/analytics/revenue-chart';
import { OrderBreakdownChart } from '../../../components/analytics/order-breakdown-chart';
import { DateRangeSelector } from '../../../components/analytics/date-range-selector';
import {
  useAnalyticsSummary,
  useVolumeData,
  useRevenueData,
  useOrderBreakdown,
} from '../../../hooks/use-analytics';
import type { AnalyticsQueryParams } from '../../../types/analytics';

export default function AnalyticsPage() {
  const [params, setParams] = useState<AnalyticsQueryParams>({
    period: 'daily',
  });

  const handleDateRangeChange = (from: string, to: string) => {
    setParams((prev) => ({ ...prev, from, to }));
  };

  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(params);
  const { data: volumeData, isLoading: volumeLoading } = useVolumeData(params);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData(params);
  const { data: orderBreakdown, isLoading: breakdownLoading } = useOrderBreakdown(params);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Platform metrics and performance insights
            </p>
          </div>
        </div>
        <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
      </div>

      {/* Summary Cards */}
      <SummaryCards data={summary} isLoading={summaryLoading} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="text-base font-medium mb-4">Volume</h2>
          <VolumeChart data={volumeData} isLoading={volumeLoading} />
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="text-base font-medium mb-4">Revenue</h2>
          <RevenueChart data={revenueData} isLoading={revenueLoading} />
        </div>
      </div>

      {/* Order Breakdown */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <h2 className="text-base font-medium mb-4">Order Breakdown</h2>
        <OrderBreakdownChart data={orderBreakdown} isLoading={breakdownLoading} />
      </div>
    </div>
  );
}
