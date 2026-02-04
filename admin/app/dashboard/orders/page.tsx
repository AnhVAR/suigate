'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import type { OrderFilters } from '../../../types/orders';
import type { AdminOrderDto } from '../../../types/orders';
import { useOrders } from '../../../hooks/use-orders';
import { OrderFiltersComponent } from '../../../components/orders/order-filters';
import { OrdersTable } from '../../../components/orders/orders-table';
import { OrderDetailPanel } from '../../../components/orders/order-detail-panel';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDto | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Parse filters from URL
  const [filters, setFilters] = useState<OrderFilters>(() => ({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '50'),
    order_type: (searchParams.get('order_type') as any) || undefined,
    status: (searchParams.get('status') as any) || undefined,
    needs_manual_review: searchParams.get('needs_manual_review') === 'true' ? true : undefined,
    date_from: searchParams.get('date_from') || undefined,
    date_to: searchParams.get('date_to') || undefined,
    search: searchParams.get('search') || undefined,
  }));

  // Fetch orders
  const { data, isLoading, error } = useOrders(filters);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.page && filters.page !== 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 50) params.set('limit', filters.limit.toString());
    if (filters.order_type) params.set('order_type', filters.order_type);
    if (filters.status) params.set('status', filters.status);
    if (filters.needs_manual_review) params.set('needs_manual_review', 'true');
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    if (filters.search) params.set('search', filters.search);

    const queryString = params.toString();
    router.replace(`/dashboard/orders${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [filters, router]);

  const handleRowClick = (order: AdminOrderDto) => {
    setSelectedOrder(order);
    setDetailPanelOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor all orders across the platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <OrderFiltersComponent filters={filters} onFiltersChange={setFilters} />

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
            Failed to load orders: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && !error && data && (
        <>
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <OrdersTable orders={data.orders} onRowClick={handleRowClick} />
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-4 py-3">
              <div className="text-sm text-muted-foreground">
                Showing page <span className="text-foreground font-medium">{data.page}</span> of{' '}
                <span className="text-foreground font-medium">{data.totalPages}</span>{' '}
                ({data.total} total orders)
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

      {/* Order Detail Panel */}
      <OrderDetailPanel
        order={selectedOrder}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
      />
    </div>
  );
}
