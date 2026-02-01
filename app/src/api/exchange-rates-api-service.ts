/**
 * Exchange Rates API Service
 * Handles public rate endpoints (no auth required)
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api-base-configuration';
import type { RatesResponseDto } from '@suigate/shared-types';

export const exchangeRatesApiService = {
  /**
   * Get current exchange rates (public endpoint)
   */
  getCurrentRates: async (): Promise<RatesResponseDto> => {
    const response = await axios.get<RatesResponseDto>(`${API_BASE_URL}/rates/current`);
    return response.data;
  },
};
