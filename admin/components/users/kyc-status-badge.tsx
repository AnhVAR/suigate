import { Badge } from '../ui/badge';
import type { KycStatus } from '../../types/database.types';

interface KycStatusBadgeProps {
  status: KycStatus;
}

export function KycStatusBadge({ status }: KycStatusBadgeProps) {
  const variants: Record<KycStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    approved: { variant: 'default', label: 'Approved' },
    rejected: { variant: 'destructive', label: 'Rejected' },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}>
      {config.label}
    </Badge>
  );
}
