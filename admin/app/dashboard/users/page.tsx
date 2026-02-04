'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import type { AdminUsersQueryParams } from '../../../types/users';
import type { AdminUserDto } from '../../../types/users';
import { useUsers, useUser } from '../../../hooks/use-users';
import { UserFilters } from '../../../components/users/user-filters';
import { UsersTable } from '../../../components/users/users-table';
import { UserDetailPanel } from '../../../components/users/user-detail-panel';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Parse filters from URL
  const [filters, setFilters] = useState<AdminUsersQueryParams>(() => ({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '50'),
    kyc_status: (searchParams.get('kyc_status') as any) || undefined,
    location_verified: searchParams.get('location_verified') === 'true' ? true : undefined,
    is_locked: searchParams.get('is_locked') === 'true' ? true : undefined,
    date_from: searchParams.get('date_from') || undefined,
    date_to: searchParams.get('date_to') || undefined,
    search: searchParams.get('search') || undefined,
  }));

  // Fetch users list
  const { data, isLoading, error } = useUsers(filters);

  // Fetch selected user details
  const { data: userDetail } = useUser(selectedUserId || '');

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.page && filters.page !== 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 50) params.set('limit', filters.limit.toString());
    if (filters.kyc_status) params.set('kyc_status', filters.kyc_status);
    if (filters.location_verified) params.set('location_verified', 'true');
    if (filters.is_locked) params.set('is_locked', 'true');
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    if (filters.search) params.set('search', filters.search);

    const queryString = params.toString();
    router.replace(`/dashboard/users${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [filters, router]);

  const handleRowClick = (user: AdminUserDto) => {
    setSelectedUserId(user.id);
    setDetailPanelOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Check if current user is admin (you can implement proper auth check)
  const isAdmin = true; // TODO: Replace with actual admin role check

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
          <Users className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts, KYC status, and permissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <UserFilters filters={filters} onFiltersChange={setFilters} />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load users: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !error && data && (
        <>
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <UsersTable users={data.users} onRowClick={handleRowClick} />
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-4 py-3">
              <div className="text-sm text-muted-foreground">
                Showing page <span className="text-foreground font-medium">{data.page}</span> of{' '}
                <span className="text-foreground font-medium">{data.totalPages}</span>{' '}
                ({data.total} total users)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page === 1}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page === data.totalPages}
                  className="cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Detail Panel */}
      <UserDetailPanel
        user={userDetail || null}
        open={detailPanelOpen}
        onOpenChange={(open) => {
          setDetailPanelOpen(open);
          if (!open) {
            setSelectedUserId(null);
          }
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
