'use client';

/**
 * React Query Provider for client-side data fetching
 * Wraps the app with QueryClientProvider
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 1 hour (data is considered fresh for 1 hour)
            staleTime: 60 * 60 * 1000,
            // Cache time: 5 minutes (unused data is garbage collected after 5 minutes)
            gcTime: 5 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Refetch on window focus in production only
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Refetch on reconnect
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
