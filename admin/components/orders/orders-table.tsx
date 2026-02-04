'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import type { AdminOrderDto } from '../../types/orders';
import { OrderStatusBadge } from './order-status-badge';
import { OrderTypeBadge } from './order-type-badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface OrdersTableProps {
  orders: AdminOrderDto[];
  onRowClick: (order: AdminOrderDto) => void;
}

export function OrdersTable({ orders, onRowClick }: OrdersTableProps) {
  const columns = useMemo<ColumnDef<AdminOrderDto>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ row }) => (
          <span className="font-mono text-sm text-muted-foreground" title={row.original.id}>
            {truncateId(row.original.id)}
          </span>
        ),
      },
      {
        accessorKey: 'order_type',
        header: 'Type',
        cell: ({ row }) => <OrderTypeBadge type={row.original.order_type} />,
      },
      {
        accessorKey: 'amount_usdc',
        header: 'USDC',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.amount_usdc ? formatUsdc(row.original.amount_usdc) : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'amount_vnd',
        header: 'VND',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.amount_vnd ? formatVnd(row.original.amount_vnd) : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'user_sui_address',
        header: 'User',
        cell: ({ row }) => (
          <span className="font-mono text-sm text-muted-foreground" title={row.original.user_sui_address}>
            {truncateAddress(row.original.user_sui_address)}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(row.original.created_at)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(row.original);
            }}
            className="cursor-pointer"
          >
            View
          </Button>
        ),
      },
    ],
    [onRowClick]
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No orders found matching your filters.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-border/50 hover:bg-transparent">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="text-muted-foreground font-medium">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            onClick={() => onRowClick(row.original)}
            className="cursor-pointer border-border/50 transition-colors hover:bg-accent/50"
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Utility functions
function truncateId(id: string): string {
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

function truncateAddress(address: string): string {
  if (!address) return '—';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatUsdc(amount: number): string {
  return `${amount.toFixed(2)} USDC`;
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
