'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import type { AdminUserDto } from '../../types/users';
import { KycStatusBadge } from './kyc-status-badge';
import { AccountStatusBadge } from './account-status-badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Check, X, Copy } from 'lucide-react';

interface UsersTableProps {
  users: AdminUserDto[];
  onRowClick: (user: AdminUserDto) => void;
}

export function UsersTable({ users, onRowClick }: UsersTableProps) {
  const columns = useMemo<ColumnDef<AdminUserDto>[]>(
    () => [
      {
        accessorKey: 'sui_address',
        header: 'Address',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground" title={row.original.sui_address}>
              {truncateAddress(row.original.sui_address)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(row.original.sui_address);
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        ),
      },
      {
        accessorKey: 'kyc_status',
        header: 'KYC Status',
        cell: ({ row }) => <KycStatusBadge status={row.original.kyc_status} />,
      },
      {
        accessorKey: 'location_verified',
        header: 'Location',
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.location_verified ? (
              <Check className="h-5 w-5 text-emerald-400" />
            ) : (
              <X className="h-5 w-5 text-muted-foreground/50" />
            )}
          </div>
        ),
      },
      {
        accessorKey: 'is_locked',
        header: 'Account Status',
        cell: ({ row }) => <AccountStatusBadge isLocked={row.original.is_locked} />,
      },
      {
        accessorKey: 'order_count',
        header: 'Orders',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.order_count}</span>
        ),
      },
      {
        accessorKey: 'total_volume_usdc',
        header: 'Volume',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {formatUsdc(row.original.total_volume_usdc)}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Joined',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.created_at)}
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
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No users found matching your filters.</p>
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
function truncateAddress(address: string): string {
  if (!address) return '—';
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function formatUsdc(amount: number): string {
  return `${amount.toFixed(2)} USDC`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}
