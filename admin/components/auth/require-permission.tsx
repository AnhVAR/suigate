'use client';

import { ReactNode } from 'react';
import { useAdminSession } from '@/hooks/use-admin-session';
import { hasPermission, type Permission } from '@/lib/admin-rbac';

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermission({
  permission,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { role } = useAdminSession();

  if (!role || !hasPermission(role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
