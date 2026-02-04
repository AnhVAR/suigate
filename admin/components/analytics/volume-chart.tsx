'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { VolumeDataPoint } from '../../types/analytics';

interface VolumeChartProps {
  data: VolumeDataPoint[] | undefined;
  isLoading: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function VolumeChart({ data, isLoading }: VolumeChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Volume Trends</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Volume Trends</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Volume Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value: number | undefined) => formatCurrency(value || 0)}
            labelFormatter={(label: any) => formatDate(String(label))}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="buy_volume"
            stackId="1"
            fill="#10b981"
            stroke="#10b981"
            name="Buy Volume"
          />
          <Area
            type="monotone"
            dataKey="sell_volume"
            stackId="1"
            fill="#f59e0b"
            stroke="#f59e0b"
            name="Sell Volume"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
