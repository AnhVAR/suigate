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
      toDate.setHours(23, 59, 59, 999);
      onDateRangeChange(fromDate.toISOString(), toDate.toISOString());
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2">
      <span className="text-sm font-medium text-muted-foreground">Range:</span>

      <Button
        variant={selectedRange === '7d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleQuickSelect('7d')}
        className="cursor-pointer"
      >
        7D
      </Button>

      <Button
        variant={selectedRange === '30d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleQuickSelect('30d')}
        className="cursor-pointer"
      >
        30D
      </Button>

      <Button
        variant={selectedRange === '90d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleQuickSelect('90d')}
        className="cursor-pointer"
      >
        90D
      </Button>

      <div className="flex items-center gap-2 ml-2">
        <input
          type="date"
          value={customFrom}
          onChange={(e) => setCustomFrom(e.target.value)}
          className="h-8 rounded-md border border-border/50 bg-background px-2 text-sm text-foreground"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <input
          type="date"
          value={customTo}
          onChange={(e) => setCustomTo(e.target.value)}
          className="h-8 rounded-md border border-border/50 bg-background px-2 text-sm text-foreground"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleCustomApply}
          disabled={!customFrom || !customTo}
          className="cursor-pointer"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
