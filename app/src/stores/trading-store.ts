/**
 * Trading Store
 * Manages order state for buy, quick sell, and smart sell flows
 */

import { create } from 'zustand';
import { ordersBuySellApiService } from '../api/orders-buy-sell-api-service';
import type {
  OrderDto,
  CreateBuyOrderDto,
  CreateQuickSellOrderDto,
  CreateSmartSellOrderDto,
} from '@suigate/shared-types';

type OrderType = 'buy' | 'quick_sell' | 'smart_sell';
type OrderStatus =
  | 'idle'
  | 'creating'
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'expired';

interface TradingState {
  // Current order
  orderType: OrderType | null;
  orderStatus: OrderStatus;
  orderId: string | null;

  // Buy specific
  qrData: string | null;
  reference: string | null;
  expiresAt: Date | null;

  // All orders
  orders: OrderDto[];
  isLoadingOrders: boolean;

  // Rate
  currentRate: number;
  isLoadingRate: boolean;

  // Actions
  createBuyOrder: (amountVnd: number) => Promise<void>;
  createQuickSellOrder: (amountUsdc: number, bankAccountId: number) => Promise<void>;
  createSmartSellOrder: (
    amountUsdc: number,
    targetRate: number,
    bankAccountId: number
  ) => Promise<void>;
  fetchOrders: () => Promise<void>;
  confirmOrder: (orderId: string, txHash: string) => Promise<void>;
  addEscrow: (orderId: string, escrowObjectId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  setOrderType: (type: OrderType | null) => void;
  setOrderStatus: (status: OrderStatus) => void;
  setOrder: (order: {
    orderId: string;
    qrData?: string;
    reference?: string;
    expiresAt?: Date;
  }) => void;
  setRate: (rate: number) => void;
  setLoadingRate: (loading: boolean) => void;
  reset: () => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  orderType: null,
  orderStatus: 'idle',
  orderId: null,
  qrData: null,
  reference: null,
  expiresAt: null,
  orders: [],
  isLoadingOrders: false,
  currentRate: 25000,
  isLoadingRate: false,

  createBuyOrder: async (amountVnd: number) => {
    set({ orderStatus: 'creating' });
    try {
      const dto: CreateBuyOrderDto = { amountVnd };
      const response = await ordersBuySellApiService.createBuyOrder(dto);

      set({
        orderType: 'buy',
        orderId: response.orderId,
        qrData: response.qrCode,
        reference: response.reference,
        expiresAt: new Date(response.expiresAt),
        orderStatus: 'pending',
      });
    } catch (error) {
      set({ orderStatus: 'failed' });
      throw error;
    }
  },

  createQuickSellOrder: async (amountUsdc: number, bankAccountId: number) => {
    set({ orderStatus: 'creating' });
    try {
      const dto: CreateQuickSellOrderDto = {
        amountUsdc: amountUsdc.toString(),
        bankAccountId
      };
      const response = await ordersBuySellApiService.createQuickSellOrder(dto);

      set({
        orderType: 'quick_sell',
        orderId: response.orderId,
        orderStatus: 'pending',
      });
    } catch (error) {
      set({ orderStatus: 'failed' });
      throw error;
    }
  },

  createSmartSellOrder: async (
    amountUsdc: number,
    targetRate: number,
    bankAccountId: number
  ) => {
    set({ orderStatus: 'creating' });
    try {
      const dto: CreateSmartSellOrderDto = {
        amountUsdc: amountUsdc.toString(),
        targetRate,
        bankAccountId
      };
      const response = await ordersBuySellApiService.createSmartSellOrder(dto);

      set({
        orderType: 'smart_sell',
        orderId: response.orderId,
        orderStatus: 'pending',
      });
    } catch (error) {
      set({ orderStatus: 'failed' });
      throw error;
    }
  },

  fetchOrders: async () => {
    set({ isLoadingOrders: true });
    try {
      const response = await ordersBuySellApiService.listOrders();
      set({ orders: response.orders, isLoadingOrders: false });
    } catch (error) {
      set({ isLoadingOrders: false });
      throw error;
    }
  },

  confirmOrder: async (orderId: string, txHash: string) => {
    try {
      await ordersBuySellApiService.confirmOrder(orderId, { txHash });
      set({ orderStatus: 'success' });
    } catch (error) {
      set({ orderStatus: 'failed' });
      throw error;
    }
  },

  addEscrow: async (orderId: string, escrowObjectId: string) => {
    try {
      await ordersBuySellApiService.addEscrow(orderId, escrowObjectId);
    } catch (error) {
      throw error;
    }
  },

  cancelOrder: async (orderId: string) => {
    try {
      await ordersBuySellApiService.cancelOrder(orderId);
      // Refresh orders list
      const response = await ordersBuySellApiService.listOrders();
      set({ orders: response.orders });
    } catch (error) {
      throw error;
    }
  },

  setOrderType: (type) => set({ orderType: type }),
  setOrderStatus: (status) => set({ orderStatus: status }),
  setOrder: (order) =>
    set({
      orderId: order.orderId,
      qrData: order.qrData || null,
      reference: order.reference || null,
      expiresAt: order.expiresAt || null,
      orderStatus: 'pending',
    }),
  setRate: (rate) => set({ currentRate: rate }),
  setLoadingRate: (loading) => set({ isLoadingRate: loading }),
  reset: () =>
    set({
      orderType: null,
      orderStatus: 'idle',
      orderId: null,
      qrData: null,
      reference: null,
      expiresAt: null,
    }),
}));
