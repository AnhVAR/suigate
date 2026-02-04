'use client';

import { useState, useEffect } from 'react';
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

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KYC Status */}
        <div className="space-y-2">
          <Label>KYC Status</Label>
          <Select
            value={filters.kyc_status || 'all'}
            onValueChange={handleKycStatusChange}
          >
            <SelectTrigger>
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
          <Label>Search</Label>
          <Input
            placeholder="Address or Google ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Location Verified */}
        <div className="space-y-2">
          <Label>Location</Label>
          <div className="flex items-center space-x-2 h-10">
            <Checkbox
              id="location-verified"
              checked={filters.location_verified || false}
              onCheckedChange={handleLocationVerifiedChange}
            />
            <label
              htmlFor="location-verified"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Verified Only
            </label>
          </div>
        </div>

        {/* Locked */}
        <div className="space-y-2">
          <Label>Account Status</Label>
          <div className="flex items-center space-x-2 h-10">
            <Checkbox
              id="is-locked"
              checked={filters.is_locked || false}
              onCheckedChange={handleLockedChange}
            />
            <label
              htmlFor="is-locked"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Locked Only
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
