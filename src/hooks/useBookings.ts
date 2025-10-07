import { useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * Bookings Response Interface
 */
interface Booking {
  id: string
  status: string
  price: number
  periodInMonths: number
  foodIncluded: boolean
  createdAt: string
  property?: {
    id: string
    name: string
    location?: string
    images?: Array<{
      id: string
      url: string
      alt?: string
    }>
  }
  room?: {
    id: string
    name: string
    type?: string
  }
  roomSnapshot?: {
    name: string
    type?: string
    price?: number
  }
}

interface BookingsResponse {
  bookings: Booking[]
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
    active: number
    pending: number
  }
}

interface BookingsParams {
  page?: number
  limit?: number
  status?: string
  sortBy?: string
  sortOrder?: string
  search?: string
  history?: boolean
}

/**
 * Fetch bookings from API
 */
const fetchBookings = async (params: BookingsParams): Promise<BookingsResponse> => {
  const searchParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    limit: (params.limit || 10).toString(),
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
    ...(params.status && params.status !== 'all' && { status: params.status }),
    ...(params.search && { search: params.search }),
    ...(params.history && { history: 'true' }),
  })

  const response = await fetch(`/api/custom/customers/bookings?${searchParams}`)

  if (!response.ok) {
    throw new Error('Failed to fetch bookings')
  }

  return response.json()
}

/**
 * Hook to fetch customer bookings with caching and pagination
 *
 * Features:
 * - Automatic caching (3 minutes stale time)
 * - Background refetching
 * - Pagination support
 * - Filter support
 * - Search support
 */
export function useBookings(params: BookingsParams = {}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => fetchBookings(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook to prefetch next/previous page of bookings
 */
export function usePrefetchBookings() {
  const queryClient = useQueryClient()

  const prefetchPage = (params: BookingsParams) => {
    queryClient.prefetchQuery({
      queryKey: ['bookings', params],
      queryFn: () => fetchBookings(params),
      staleTime: 3 * 60 * 1000,
    })
  }

  return { prefetchPage }
}

/**
 * Hook to invalidate bookings cache
 */
export function useInvalidateBookings() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  return { invalidate }
}
