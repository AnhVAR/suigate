import { apiClient } from '../api-client';
import type {
  AdminUsersResponse,
  AdminUserDetailDto,
  AdminUsersQueryParams,
  UpdateKycDto,
  LockUserDto,
} from '../../types/users';

export const usersApi = {
  list: async (params: AdminUsersQueryParams): Promise<AdminUsersResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.kyc_status) queryParams.append('kyc_status', params.kyc_status);
    if (params.location_verified !== undefined) {
      queryParams.append('location_verified', params.location_verified.toString());
    }
    if (params.is_locked !== undefined) {
      queryParams.append('is_locked', params.is_locked.toString());
    }
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<AdminUsersResponse>(endpoint);
  },

  get: async (id: string): Promise<AdminUserDetailDto> => {
    return apiClient.get<AdminUserDetailDto>(`/admin/users/${id}`);
  },

  updateKyc: async (id: string, data: UpdateKycDto): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>(`/admin/users/${id}/kyc`, data);
  },

  lock: async (id: string, data: LockUserDto): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/admin/users/${id}/lock`, data);
  },

  unlock: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/admin/users/${id}/unlock`);
  },
};
