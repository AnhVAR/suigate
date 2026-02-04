'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAdminSession,
  clearAdminSession,
  decodeAdminToken,
  type AdminTokenPayload,
} from '@/lib/admin-session';

export interface AdminUser {
  userId: string;
  suiAddress: string;
  role: 'admin' | 'support';
}

export function useAdminSession() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get session from cookie on mount
    const token = getAdminSession();

    if (!token) {
      setIsLoading(false);
      return;
    }

    const payload = decodeAdminToken(token);

    if (!payload) {
      // Invalid or expired token
      clearAdminSession();
      setIsLoading(false);
      return;
    }

    // Set user from token payload
    setUser({
      userId: payload.sub,
      suiAddress: payload.sui_address,
      role: payload.role,
    });

    setIsLoading(false);
  }, []);

  const logout = () => {
    clearAdminSession();
    setUser(null);
    router.push('/auth/login');
  };

  return {
    user,
    role: user?.role || null,
    isLoading,
    isAuthenticated: user !== null,
    logout,
  };
}
