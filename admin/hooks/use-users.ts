import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../lib/api/users-api';
import type { AdminUsersQueryParams, UpdateKycDto, LockUserDto } from '../types/users';

export function useUsers(filters: AdminUsersQueryParams) {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => usersApi.list(filters),
    staleTime: 30_000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['admin-users', id],
    queryFn: () => usersApi.get(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useUpdateKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKycDto }) =>
      usersApi.updateKyc(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useLockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LockUserDto }) =>
      usersApi.lock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUnlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.unlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
