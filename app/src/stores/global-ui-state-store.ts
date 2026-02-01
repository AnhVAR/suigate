/**
 * Global UI State Store
 * Manages global loading states, toasts, and alerts
 */

import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface GlobalUiState {
  // Global loading
  isGlobalLoading: boolean;

  // Toasts
  toasts: Toast[];

  // Actions
  setGlobalLoading: (loading: boolean) => void;
  showToast: (type: Toast['type'], message: string) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useGlobalUiStore = create<GlobalUiState>((set, get) => ({
  isGlobalLoading: false,
  toasts: [],

  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  showToast: (type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    set({ toasts: [...get().toasts, { id, type, message }] });

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      get().dismissToast(id);
    }, 3000);
  },

  dismissToast: (id) =>
    set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  clearAllToasts: () => set({ toasts: [] }),
}));
