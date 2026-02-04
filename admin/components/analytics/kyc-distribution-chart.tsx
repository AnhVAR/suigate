'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { KycDistribution } from '../../types/analytics';

interface KycDistributionChartProps {
  data: KycDistribution | undefined;
  isLoading: boolean;
}

const COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

export function KycDistributionChart({ data, isLoading }: KycDistributionChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">KYC Distribution</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">KYC Distribution</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Pending', value: data.pending, color: COLORS.pending },
    { name: 'Approved', value: data.approved, color: COLORS.approved },
    { name: 'Rejected', value: data.rejected, color: COLORS.rejected },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">KYC Distribution</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">KYC Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
