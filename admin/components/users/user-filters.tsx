'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { AdminUsersQueryParams } from '../../types/users';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';

interface UserFiltersProps {
  filters: AdminUsersQueryParams;
  onFiltersChange: (filters: AdminUsersQueryParams) => void;
}

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
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

  const handleKycStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      kyc_status: value === 'all' ? undefined : (value as any),
      page: 1,
    });
  };

  const handleLocationVerifiedChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      location_verified: checked ? true : undefined,
      page: 1,
    });
  };

  const handleLockedChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      is_locked: checked ? true : undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  const hasActiveFilters = filters.kyc_status || filters.location_verified || filters.is_locked || searchInput;

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* KYC Status */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">KYC Status</Label>
          <Select
            value={filters.kyc_status || 'all'}
            onValueChange={handleKycStatusChange}
          >
            <SelectTrigger className="bg-background border-border/50">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Address or Google ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-background border-border/50 pl-9"
            />
          </div>
        </div>

        {/* Location Verified */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Location</Label>
          <div className="flex h-10 items-center space-x-2">
            <Checkbox
              id="location-verified"
              checked={filters.location_verified || false}
              onCheckedChange={handleLocationVerifiedChange}
              className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor="location-verified"
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Verified Only
            </label>
          </div>
        </div>

        {/* Locked */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Account Status</Label>
          <div className="flex h-10 items-center space-x-2">
            <Checkbox
              id="is-locked"
              checked={filters.is_locked || false}
              onCheckedChange={handleLockedChange}
              className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor="is-locked"
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Locked Only
            </label>
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
