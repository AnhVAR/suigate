'use client';

import { User } from 'lucide-react';
import { SidebarCollapseButton } from './admin-sidebar';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  user?: {
    suiAddress: string;
  } | null;
  role?: 'admin' | 'support' | null;
}

export function AdminHeader({ user, role }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
      <div className="flex items-center gap-3">
        <SidebarCollapseButton />
        <div className="h-5 w-px bg-border/50" />
        <h1 className="text-sm font-medium text-muted-foreground">
          Admin Dashboard
        </h1>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          {/* Role Badge */}
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              role === 'admin'
                ? 'bg-primary/10 text-primary'
                : 'bg-secondary text-secondary-foreground'
            )}
          >
            {role === 'admin' ? 'Admin' : 'Support'}
          </span>

          {/* User Info */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              {user.suiAddress.slice(0, 6)}...{user.suiAddress.slice(-4)}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
