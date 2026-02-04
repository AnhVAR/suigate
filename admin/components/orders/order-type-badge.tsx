import type { OrderType } from '../../types/orders';
import { Badge } from '../ui/badge';

interface OrderTypeBadgeProps {
  type: OrderType;
}

export function OrderTypeBadge({ type }: OrderTypeBadgeProps) {
  const variants: Record<OrderType, { label: string; className: string }> = {
    buy: {
      label: 'Buy',
      className: 'bg-green-500 text-green-50 hover:bg-green-600'
    },
    quick_sell: {
      label: 'Quick Sell',
      className: 'bg-orange-500 text-orange-50 hover:bg-orange-600'
    },
    smart_sell: {
      label: 'Smart Sell',
      className: 'bg-blue-500 text-blue-50 hover:bg-blue-600'
    },
  };

  const { label, className } = variants[type];

  return (
    <Badge variant="default" className={className}>
      {label}
    </Badge>
  );
}
