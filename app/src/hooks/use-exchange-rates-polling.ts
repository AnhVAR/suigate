/**
 * Exchange Rates Polling Hook
 * Polls exchange rates every 30 seconds
 */

import { useEffect, useState } from 'react';
import { exchangeRatesApiService } from '../api/exchange-rates-api-service';
import type { RatesResponseDto } from '@suigate/shared-types';

const POLLING_INTERVAL = 30000; // 30 seconds

interface UseRatesResult {
  rates: RatesResponseDto | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and poll exchange rates
 */
export const useExchangeRatesPolling = (): UseRatesResult => {
  const [rates, setRates] = useState<RatesResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    try {
      setError(null);
      const data = await exchangeRatesApiService.getCurrentRates();
      setRates(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchRates();

    // Poll every 30 seconds
    const interval = setInterval(fetchRates, POLLING_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    rates,
    isLoading,
    error,
    refresh: fetchRates,
  };
};
