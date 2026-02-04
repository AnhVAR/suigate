import type { OrderType } from '../../types/orders';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface OrderTypeBadgeProps {
  type: OrderType;
}

const typeConfig: Record<OrderType, { label: string; className: string }> = {
  buy: {
    label: 'Buy',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  quick_sell: {
    label: 'Quick Sell',
    className: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  smart_sell: {
    label: 'Smart Sell',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
};

export function OrderTypeBadge({ type }: OrderTypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium border', config.className)}
    >
      {config.label}
    </Badge>
  );
}
