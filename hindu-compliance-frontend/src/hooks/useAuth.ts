'use client';

/**
 * Authentication hook for client-side session management
 */

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { NandiSession } from '@/types';

interface SessionResponse {
  session: Omit<NandiSession, 'refresh_token'> | null;
}

/**
 * Fetch current session from API
 */
async function fetchSession(): Promise<SessionResponse> {
  const response = await fetch('/api/auth/session');
  if (!response.ok && response.status !== 401) {
    throw new Error('Failed to fetch session');
  }
  return response.json();
}

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const router = useRouter();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<SessionResponse>({
    queryKey: ['auth', 'session'],
    queryFn: fetchSession,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const session = data?.session || null;
  const isAuthenticated = !!session;

  /**
   * Initiate sign-in flow
   */
  const signIn = (redirectUrl?: string) => {
    const params = redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : '';
    router.push(`/auth/sign-in${params}`);
  };

  /**
   * Sign out user
   */
  const signOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    router.push('/');
    refetch();
  };

  return {
    session,
    user: session?.user || null,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    refetch,
  };
}
