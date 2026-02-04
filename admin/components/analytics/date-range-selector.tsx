'use client';

import { useState } from 'react';
import { Button } from '../ui/button';

interface DateRangeSelectorProps {
  onDateRangeChange: (from: string, to: string) => void;
}

export function DateRangeSelector({ onDateRangeChange }: DateRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const handleQuickSelect = (range: '7d' | '30d' | '90d') => {
    setSelectedRange(range);
    const to = new Date();
    const from = new Date();

    if (range === '7d') {
      from.setDate(to.getDate() - 7);
    } else if (range === '30d') {
      from.setDate(to.getDate() - 30);
    } else if (range === '90d') {
      from.setDate(to.getDate() - 90);
    }

    onDateRangeChange(from.toISOString(), to.toISOString());
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      setSelectedRange('custom');
      const fromDate = new Date(customFrom);
      const toDate = new Date(customTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      onDateRangeChange(fromDate.toISOString(), toDate.toISOString());
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-white rounded-lg border">
      <span className="text-sm font-medium text-gray-700">Date Range:</span>

      <Button
        variant={selectedRange === '7d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleQuickSelect('7d')}
      >
        7 Days
      </Button>

      <Button
        variant={selectedRange === '30d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleQuickSelect('30d')}
      >
        30 Days
      </Button>

      <Button
        variant={selectedRange === '90d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleQuickSelect('90d')}
      >
        90 Days
      </Button>

      <div className="flex items-center gap-2 ml-4">
        <input
          type="date"
          value={customFrom}
          onChange={(e) => setCustomFrom(e.target.value)}
          className="px-2 py-1 text-sm border rounded"
        />
        <span className="text-sm text-gray-500">to</span>
        <input
          type="date"
          value={customTo}
          onChange={(e) => setCustomTo(e.target.value)}
          className="px-2 py-1 text-sm border rounded"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleCustomApply}
          disabled={!customFrom || !customTo}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
