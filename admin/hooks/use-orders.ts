import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../lib/api/orders-api';
import type { OrderFilters, UpdateOrderStatusDto } from '../types/orders';

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: () => ordersApi.list(filters),
    staleTime: 30_000, // 30s cache
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['admin-orders', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusDto }) =>
      ordersApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersApi.confirmPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

export function useDispenseUsdc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersApi.dispenseUsdc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

export function useDisburseVnd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersApi.disburseVnd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

export function useSimulatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => ordersApi.simulatePayment(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}
