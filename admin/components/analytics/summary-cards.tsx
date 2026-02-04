'use client';

import { DollarSign, TrendingUp, Users, Clock } from 'lucide-react';
import type { AnalyticsSummary } from '../../types/analytics';
import { cn } from '@/lib/utils';

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

interface CardConfig {
  key: string;
  title: string;
  icon: typeof DollarSign;
  colorClass: string;
  bgClass: string;
  glowClass: string;
  value?: string;
  badge?: string;
}

const cardConfig: CardConfig[] = [
  {
    key: 'volume',
    title: 'Total Volume',
    icon: DollarSign,
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10',
    glowClass: 'hover:shadow-blue-500/10',
  },
  {
    key: 'revenue',
    title: 'Revenue',
    icon: TrendingUp,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    glowClass: 'hover:shadow-emerald-500/10',
  },
  {
    key: 'users',
    title: 'Active Users',
    icon: Users,
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
    glowClass: 'hover:shadow-purple-500/10',
  },
  {
    key: 'pending',
    title: 'Pending Orders',
    icon: Clock,
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
    glowClass: 'hover:shadow-amber-500/10',
  },
];

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardConfig.map((config) => (
          <div
            key={config.key}
            className="rounded-xl border border-border/50 bg-card p-6 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
            <div className="h-8 w-32 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards: CardConfig[] = [
    {
      ...cardConfig[0],
      value: formatNumber(data.total_volume_usdc),
    },
    {
      ...cardConfig[1],
      value: formatNumber(data.total_revenue_usdc),
    },
    {
      ...cardConfig[2],
      value: `${data.active_users} / ${data.total_users}`,
    },
    {
      ...cardConfig[3],
      value: data.pending_orders.toString(),
      badge: data.needs_review_orders > 0 ? `${data.needs_review_orders} need review` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={cn(
            'group rounded-xl border border-border/50 bg-card p-6 transition-all duration-200',
            'hover:border-border hover:shadow-lg',
            card.glowClass
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', card.bgClass)}>
                <card.icon className={cn('h-5 w-5', card.colorClass)} />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
            </div>
            {card.badge && (
              <span className="text-xs rounded-full bg-red-500/15 px-2 py-1 text-red-400">
                {card.badge}
              </span>
            )}
          </div>
          <p className={cn('text-2xl font-semibold', card.colorClass)}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
