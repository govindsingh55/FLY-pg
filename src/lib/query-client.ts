import { QueryClient } from '@tanstack/react-query'

/**
 * Create QueryClient with optimized configuration
 *
 * Configuration:
 * - staleTime: 5 minutes (data considered fresh for 5 min)
 * - cacheTime: 10 minutes (keep unused data in cache for 10 min)
 * - retry: 1 (retry failed requests once)
 * - refetchOnWindowFocus: true (refetch when user returns to tab)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh (no refetch needed)
      staleTime: 5 * 60 * 1000, // 5 minutes

      // How long unused data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)

      // Retry failed requests once
      retry: 1,

      // Refetch when window regains focus
      refetchOnWindowFocus: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: true,

      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,

      // Global error handler
      onError: (error) => {
        console.error('Mutation error:', error)
      },
    },
  },
})

/**
 * Create a new QueryClient instance
 * Used for server-side rendering and testing
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
      },
    },
  })
}
