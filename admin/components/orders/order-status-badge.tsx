import type { OrderStatus } from '../../types/orders';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  paid: {
    label: 'Paid',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  processing: {
    label: 'Processing',
    className: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
  settled: {
    label: 'Settled',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium border', config.className)}
    >
      {config.label}
    </Badge>
  );
}
