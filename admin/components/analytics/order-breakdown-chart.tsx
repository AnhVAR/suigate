'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { OrderBreakdown } from '../../types/analytics';

interface OrderBreakdownChartProps {
  data: OrderBreakdown | undefined;
  isLoading: boolean;
}

const STATUS_COLORS = {
  pending: '#f59e0b',
  paid: '#3b82f6',
  processing: '#8b5cf6',
  settled: '#10b981',
  cancelled: '#6b7280',
  failed: '#ef4444',
};

export function OrderBreakdownChart({ data, isLoading }: OrderBreakdownChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Order Breakdown</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Order Breakdown</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Buy', ...data.buy },
    { name: 'Quick Sell', ...data.quick_sell },
    { name: 'Smart Sell', ...data.smart_sell },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Order Breakdown by Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} name="Pending" />
          <Bar dataKey="paid" stackId="a" fill={STATUS_COLORS.paid} name="Paid" />
          <Bar dataKey="processing" stackId="a" fill={STATUS_COLORS.processing} name="Processing" />
          <Bar dataKey="settled" stackId="a" fill={STATUS_COLORS.settled} name="Settled" />
          <Bar dataKey="cancelled" stackId="a" fill={STATUS_COLORS.cancelled} name="Cancelled" />
          <Bar dataKey="failed" stackId="a" fill={STATUS_COLORS.failed} name="Failed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
