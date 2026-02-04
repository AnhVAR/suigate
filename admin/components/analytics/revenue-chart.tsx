'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RevenueDataPoint } from '../../types/analytics';

interface RevenueChartProps {
  data: RevenueDataPoint[] | undefined;
  isLoading: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCurrency(value: number): string {
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value: number | undefined) => formatCurrency(value || 0)}
            labelFormatter={(label: any) => formatDate(String(label))}
          />
          <Legend />
          <Bar dataKey="buy_fees" fill="#3b82f6" name="Buy Fees" />
          <Bar dataKey="sell_fees" fill="#f59e0b" name="Sell Fees" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
