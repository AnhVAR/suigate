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
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const chartData = [
    { name: 'Buy', ...data.buy },
    { name: 'Quick Sell', ...data.quick_sell },
    { name: 'Smart Sell', ...data.smart_sell },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
        <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} name="Pending" radius={[0, 0, 0, 0]} />
        <Bar dataKey="paid" stackId="a" fill={STATUS_COLORS.paid} name="Paid" />
        <Bar dataKey="processing" stackId="a" fill={STATUS_COLORS.processing} name="Processing" />
        <Bar dataKey="settled" stackId="a" fill={STATUS_COLORS.settled} name="Settled" />
        <Bar dataKey="cancelled" stackId="a" fill={STATUS_COLORS.cancelled} name="Cancelled" />
        <Bar dataKey="failed" stackId="a" fill={STATUS_COLORS.failed} name="Failed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
