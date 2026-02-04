import { Badge } from '../ui/badge';

interface AccountStatusBadgeProps {
  isLocked: boolean;
}

export function AccountStatusBadge({ isLocked }: AccountStatusBadgeProps) {
  return (
    <Badge variant={isLocked ? 'destructive' : 'default'}>
      {isLocked ? 'Locked' : 'Active'}
    </Badge>
  );
}
