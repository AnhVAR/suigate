import type { OrderStatus } from '../../types/orders';
import { Badge } from '../ui/badge';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const variants: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pending', variant: 'secondary' },
    paid: { label: 'Paid', variant: 'default' },
    processing: { label: 'Processing', variant: 'default' },
    settled: { label: 'Settled', variant: 'default' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
    failed: { label: 'Failed', variant: 'destructive' },
  };

  const { label, variant } = variants[status];

  return (
    <Badge variant={variant} className={getStatusColor(status)}>
      {label}
    </Badge>
  );
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500 text-yellow-50 hover:bg-yellow-600';
    case 'paid':
      return 'bg-blue-500 text-blue-50 hover:bg-blue-600';
    case 'processing':
      return 'bg-purple-500 text-purple-50 hover:bg-purple-600';
    case 'settled':
      return 'bg-green-500 text-green-50 hover:bg-green-600';
    case 'cancelled':
      return 'bg-gray-500 text-gray-50 hover:bg-gray-600';
    case 'failed':
      return 'bg-red-500 text-red-50 hover:bg-red-600';
    default:
      return '';
  }
}
