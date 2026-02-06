/**
 * Orders Buy and Sell API Service
 * Handles all order-related endpoints (buy, quick-sell, smart-sell)
 */

import { apiClient } from './axios-client-with-auth-interceptors';
import type {
  CreateBuyOrderDto,
  BuyOrderResponseDto,
  CreateQuickSellOrderDto,
  QuickSellOrderResponseDto,
  CreateSmartSellOrderDto,
  SmartSellOrderResponseDto,
  ConfirmOrderDto,
  OrderDto,
  OrderListResponseDto,
  CancelPayloadDto,
  CancelOrderDto,
  CancelOrderResponseDto,
} from '@suigate/shared-types';

export const ordersBuySellApiService = {
  /**
   * Create buy order (VND -> USDC)
   */
  createBuyOrder: async (dto: CreateBuyOrderDto): Promise<BuyOrderResponseDto> => {
    return apiClient.post<BuyOrderResponseDto>('/orders/buy', dto);
  },

  /**
   * Create quick sell order (instant USDC -> VND)
   */
  createQuickSellOrder: async (
    dto: CreateQuickSellOrderDto
  ): Promise<QuickSellOrderResponseDto> => {
    return apiClient.post<QuickSellOrderResponseDto>('/orders/quick-sell', dto);
  },

  /**
   * Create smart sell order (target rate USDC -> VND)
   */
  createSmartSellOrder: async (
    dto: CreateSmartSellOrderDto
  ): Promise<SmartSellOrderResponseDto> => {
    return apiClient.post<SmartSellOrderResponseDto>('/orders/smart-sell', dto);
  },

  /**
   * List all user orders
   */
  listOrders: async (): Promise<OrderListResponseDto> => {
    return apiClient.get<OrderListResponseDto>('/orders');
  },

  /**
   * Get specific order details
   */
  getOrder: async (orderId: string): Promise<OrderDto> => {
    return apiClient.get<OrderDto>(`/orders/${orderId}`);
  },

  /**
   * Confirm order with transaction hash
   */
  confirmOrder: async (orderId: string, dto: ConfirmOrderDto): Promise<OrderDto> => {
    return apiClient.post<OrderDto>(`/orders/${orderId}/confirm`, dto);
  },

  /**
   * Add escrow object ID to smart sell order
   */
  addEscrow: async (orderId: string, escrowObjectId: string): Promise<OrderDto> => {
    return apiClient.post<OrderDto>(`/orders/${orderId}/escrow`, { escrowObjectId });
  },

  /**
   * Get cancel payload for smart sell order (includes remaining/filled amounts)
   */
  getCancelPayload: async (orderId: string): Promise<CancelPayloadDto> => {
    return apiClient.get<CancelPayloadDto>(`/orders/${orderId}/cancel-payload`);
  },

  /**
   * Cancel smart sell order with optional tx hash for on-chain refund
   */
  cancelOrder: async (orderId: string, dto?: CancelOrderDto): Promise<CancelOrderResponseDto> => {
    return apiClient.post<CancelOrderResponseDto>(`/orders/${orderId}/cancel`, dto || {});
  },
};
