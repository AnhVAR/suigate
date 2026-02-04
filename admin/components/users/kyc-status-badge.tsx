import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import type { KycStatus } from '../../types/database.types';

interface KycStatusBadgeProps {
  status: KycStatus;
}

const statusConfig: Record<KycStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
};

export function KycStatusBadge({ status }: KycStatusBadgeProps) {
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
