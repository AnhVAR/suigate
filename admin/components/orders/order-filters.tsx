'use client';

import { useState, useEffect } from 'react';
import type { OrderFilters } from '../../types/orders';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';

interface OrderFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
}

export function OrderFiltersComponent({ filters, onFiltersChange }: OrderFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleOrderTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      order_type: value === 'all' ? undefined : (value as any),
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as any),
      page: 1,
    });
  };

  const handleManualReviewChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      needs_manual_review: checked ? true : undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Order Type */}
        <div className="space-y-2">
          <Label>Order Type</Label>
          <Select
            value={filters.order_type || 'all'}
            onValueChange={handleOrderTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="quick_sell">Quick Sell</SelectItem>
              <SelectItem value="smart_sell">Smart Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="settled">Settled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Order ID, address, reference..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Manual Review */}
        <div className="space-y-2">
          <Label>Filters</Label>
          <div className="flex items-center space-x-2 h-10">
            <Checkbox
              id="manual-review"
              checked={filters.needs_manual_review || false}
              onCheckedChange={handleManualReviewChange}
            />
            <label
              htmlFor="manual-review"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Needs Manual Review
            </label>
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
