'use client';

import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { UserGrowthDataPoint } from '../../types/analytics';

interface UserGrowthChartProps {
  data: UserGrowthDataPoint[] | undefined;
  isLoading: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function UserGrowthChart({ data, isLoading }: UserGrowthChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">User Growth</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">User Growth</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">User Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip labelFormatter={(label: any) => formatDate(String(label))} />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="new_users"
            fill="#8b5cf6"
            name="New Users"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative_users"
            stroke="#10b981"
            strokeWidth={2}
            name="Total Users"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
