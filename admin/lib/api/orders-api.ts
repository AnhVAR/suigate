import { apiClient } from '../api-client';
import type {
  AdminOrdersResponse,
  AdminOrderDto,
  OrderFilters,
  UpdateOrderStatusDto,
} from '../../types/orders';

export const ordersApi = {
  list: async (params: OrderFilters): Promise<AdminOrdersResponse> => {
    // Build query string from params
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.order_type) queryParams.append('order_type', params.order_type);
    if (params.status) queryParams.append('status', params.status);
    if (params.needs_manual_review !== undefined) {
      queryParams.append('needs_manual_review', params.needs_manual_review.toString());
    }
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<AdminOrdersResponse>(endpoint);
  },

  get: async (id: string): Promise<AdminOrderDto> => {
    return apiClient.get<AdminOrderDto>(`/admin/orders/${id}`);
  },

  updateStatus: async (id: string, data: UpdateOrderStatusDto): Promise<AdminOrderDto> => {
    return apiClient.patch<AdminOrderDto>(`/admin/orders/${id}/status`, data);
  },

  confirmPayment: async (id: string): Promise<AdminOrderDto> => {
    return apiClient.post<AdminOrderDto>(`/admin/orders/${id}/confirm-payment`);
  },

  dispenseUsdc: async (id: string): Promise<AdminOrderDto> => {
    return apiClient.post<AdminOrderDto>(`/admin/orders/${id}/dispense-usdc`);
  },

  disburseVnd: async (id: string): Promise<AdminOrderDto> => {
    return apiClient.post<AdminOrderDto>(`/admin/orders/${id}/disburse-vnd`);
  },

  /**
   * Simulate SePay payment (sandbox/testing)
   * For testing buy USDC flow without real bank transfer
   */
  simulatePayment: async (reference: string): Promise<{ success: boolean; message?: string }> => {
    return apiClient.post<{ success: boolean; message?: string }>(
      `/webhooks/sepay/simulate/${reference}`
    );
  },
};
