'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { AdminUsersQueryParams } from '../../../types/users';
import type { AdminUserDto, AdminUserDetailDto } from '../../../types/users';
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
    router.replace(`/users${queryString ? `?${queryString}` : ''}`, { scroll: false });
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-gray-600 mt-2">Manage user accounts, KYC status, and permissions</p>
      </div>

      {/* Filters */}
      <UserFilters filters={filters} onFiltersChange={setFilters} />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load users: {(error as Error).message}</p>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !error && data && (
        <>
          <div className="bg-white rounded-lg border">
            <UsersTable users={data.users} onRowClick={handleRowClick} />
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border rounded-lg">
              <div className="text-sm text-gray-700">
                Showing page {data.page} of {data.totalPages} ({data.total} total users)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page === data.totalPages}
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
