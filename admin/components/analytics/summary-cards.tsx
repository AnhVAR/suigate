'use client';

import type { AnalyticsSummary } from '../../types/analytics';

interface SummaryCardsProps {
  data: AnalyticsSummary | undefined;
  isLoading: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      title: 'Total Volume',
      value: formatNumber(data.total_volume_usdc),
      color: 'text-blue-600',
    },
    {
      title: 'Revenue',
      value: formatNumber(data.total_revenue_usdc),
      color: 'text-green-600',
    },
    {
      title: 'Active Users',
      value: `${data.active_users} / ${data.total_users}`,
      color: 'text-purple-600',
    },
    {
      title: 'Pending Orders',
      value: data.pending_orders.toString(),
      badge: data.needs_review_orders > 0 ? `${data.needs_review_orders} need review` : undefined,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            {card.badge && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {card.badge}
              </span>
            )}
          </div>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
