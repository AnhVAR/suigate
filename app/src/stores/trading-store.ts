/**
 * Trading Store
 * Manages order state for buy, quick sell, and smart sell flows
 */

import { create } from 'zustand';

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

  // Rate
  currentRate: number;
  isLoadingRate: boolean;

  // Actions
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
  currentRate: 25000,
  isLoadingRate: false,

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
