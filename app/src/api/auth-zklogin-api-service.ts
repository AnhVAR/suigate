/**
 * Auth zkLogin API Service
 * Handles authentication endpoints for zkLogin flow
 */

import { apiClient } from './axios-client-with-auth-interceptors';
import type { ZkLoginDto, ZkLoginResponseDto } from '@suigate/shared-types';

export const authZkLoginApiService = {
  /**
   * Authenticate with zkLogin credentials
   */
  zkLogin: async (dto: ZkLoginDto): Promise<ZkLoginResponseDto> => {
    return apiClient.post<ZkLoginResponseDto>('/auth/zklogin', dto);
  },
};
