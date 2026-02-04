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
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis dataKey="date" tickFormatter={formatDate} stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis tickFormatter={formatCurrency} stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          formatter={(value: number | undefined) => formatCurrency(value || 0)}
          labelFormatter={(label: any) => formatDate(String(label))}
          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
        <Area type="monotone" dataKey="buy_volume" stackId="1" fill="#10b981" stroke="#10b981" name="Buy Volume" fillOpacity={0.6} />
        <Area type="monotone" dataKey="sell_volume" stackId="1" fill="#f59e0b" stroke="#f59e0b" name="Sell Volume" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
