'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './query-client'
import { useState } from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

/**
 * QueryProvider component
 * Wraps the app with QueryClientProvider for React Query
 * Includes devtools in development mode
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new client instance for this component tree
  // This ensures each request gets its own QueryClient in SSR
  const [client] = useState(() => queryClient)

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  )
}
