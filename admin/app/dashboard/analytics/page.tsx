'use client';

import { useState } from 'react';
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
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
      </div>

      <SummaryCards data={summary} isLoading={summaryLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Volume</h2>
          <VolumeChart data={volumeData} isLoading={volumeLoading} />
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue</h2>
          <RevenueChart data={revenueData} isLoading={revenueLoading} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Breakdown</h2>
        <OrderBreakdownChart data={orderBreakdown} isLoading={breakdownLoading} />
      </div>
    </div>
  );
}
