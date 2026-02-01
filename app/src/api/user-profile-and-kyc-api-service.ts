/**
 * User Profile and KYC API Service
 * Handles user profile and KYC/location endpoints
 */

import { apiClient } from './axios-client-with-auth-interceptors';
import type {
  UserProfileDto,
  UpdateKycDto,
  UpdateLocationDto,
} from '@suigate/shared-types';

export const userProfileAndKycApiService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfileDto> => {
    return apiClient.get<UserProfileDto>('/users/me');
  },

  /**
   * Update KYC status
   */
  updateKyc: async (dto: UpdateKycDto): Promise<UserProfileDto> => {
    return apiClient.patch<UserProfileDto>('/users/me/kyc', dto);
  },

  /**
   * Update location verification
   */
  updateLocation: async (dto: UpdateLocationDto): Promise<UserProfileDto> => {
    return apiClient.patch<UserProfileDto>('/users/me/location', dto);
  },
};
