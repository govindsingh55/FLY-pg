import { useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * Payment Response Interface
 */
interface Payment {
  id: string
  amount: number
  status: string
  paymentDate: string
  dueDate?: string
  paymentForMonthAndYear?: string
  payfor?: {
    id: string
    property?: {
      name: string
      location?: string
    }
    roomSnapshot?: {
      name: string
    }
  }
  bookingSnapshot?: {
    propertyName?: string
    roomName?: string
  }
}

interface PaymentsResponse {
  payments: Payment[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalDocs: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  stats: {
    total: number
    completed: number
    pending: number
    failed: number
    totalAmount: number
  }
}

interface PaymentsParams {
  page?: number
  limit?: number
  status?: string
  sortBy?: string
  sortOrder?: string
  search?: string
}

/**
 * Fetch payments from API
 */
const fetchPayments = async (params: PaymentsParams): Promise<PaymentsResponse> => {
  const searchParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    limit: (params.limit || 10).toString(),
    sortBy: params.sortBy || 'paymentDate',
    sortOrder: params.sortOrder || 'desc',
    ...(params.status && params.status !== 'all' && { status: params.status }),
    ...(params.search && { search: params.search }),
  })

  const response = await fetch(`/api/custom/customers/payments?${searchParams}`)

  if (!response.ok) {
    throw new Error('Failed to fetch payments')
  }

  return response.json()
}

/**
 * Hook to fetch customer payments with caching and pagination
 *
 * Features:
 * - Automatic caching (3 minutes stale time)
 * - Background refetching
 * - Pagination support
 * - Filter support
 * - Search support
 */
export function usePayments(params: PaymentsParams = {}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => fetchPayments(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook to prefetch next/previous page of payments
 */
export function usePrefetchPayments() {
  const queryClient = useQueryClient()

  const prefetchPage = (params: PaymentsParams) => {
    queryClient.prefetchQuery({
      queryKey: ['payments', params],
      queryFn: () => fetchPayments(params),
      staleTime: 3 * 60 * 1000,
    })
  }

  return { prefetchPage }
}

/**
 * Hook to invalidate payments cache
 */
export function useInvalidatePayments() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] })
  }

  return { invalidate }
}
