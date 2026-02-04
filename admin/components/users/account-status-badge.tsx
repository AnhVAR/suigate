import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface AccountStatusBadgeProps {
  isLocked: boolean;
}

export function AccountStatusBadge({ isLocked }: AccountStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        isLocked
          ? 'bg-red-500/15 text-red-400 border-red-500/30'
          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      )}
    >
      {isLocked ? 'Locked' : 'Active'}
    </Badge>
  );
}
