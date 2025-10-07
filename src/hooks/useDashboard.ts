import { useQuery } from '@tanstack/react-query'

/**
 * Dashboard Statistics Interface
 */
interface DashboardStats {
  activeBookingsCount: number
  monthlyRent: number
  paymentStatus: 'up_to_date' | 'pending' | 'overdue'
  totalSpent: number
  nextPaymentDue: string | null
  nextPaymentAmount: number
  daysUntilPayment: number | null
  pendingPaymentsCount: number
  overduePaymentsCount: number
}

/**
 * Activity Interface
 */
interface Activity {
  id: string
  type: 'payment' | 'booking' | 'extension' | 'maintenance'
  title: string
  description: string
  timestamp: string
  status?: string
  amount?: number
  icon?: string
}

/**
 * Upcoming Payment Interface
 */
interface UpcomingPayment {
  id: string
  amount: number
  dueDate: string
  property: {
    name: string
    location: string
  }
  room: {
    name: string
  }
  daysUntilDue: number
  isOverdue: boolean
  totalAmount: number
}

/**
 * Fetch dashboard statistics
 */
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/api/custom/customers/dashboard/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats')
  }
  const data = await response.json()
  return data.stats
}

/**
 * Fetch activity feed
 */
const fetchActivityFeed = async (limit = 5): Promise<Activity[]> => {
  const response = await fetch(`/api/custom/customers/dashboard/activity?limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch activity feed')
  }
  const data = await response.json()
  return data.activities || []
}

/**
 * Fetch upcoming payments
 */
const fetchUpcomingPayments = async (limit = 3): Promise<UpcomingPayment[]> => {
  const response = await fetch(`/api/custom/customers/dashboard/upcoming-payments?limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming payments')
  }
  const data = await response.json()
  return data.payments || []
}

/**
 * Hook to fetch dashboard statistics
 *
 * Features:
 * - Automatic caching (5 min stale time)
 * - Background refetching
 * - Loading and error states
 * - Automatic retry on failure
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch activity feed
 *
 * @param limit - Number of activities to fetch (default: 5)
 */
export function useActivityFeed(limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => fetchActivityFeed(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes (more fresh for activity)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch upcoming payments
 *
 * @param limit - Number of payments to fetch (default: 3)
 */
export function useUpcomingPayments(limit = 3) {
  return useQuery({
    queryKey: ['dashboard', 'upcoming-payments', limit],
    queryFn: () => fetchUpcomingPayments(limit),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch all dashboard data at once
 *
 * Combines all three queries for convenience
 * Each query is cached independently
 */
export function useDashboardData() {
  const stats = useDashboardStats()
  const activities = useActivityFeed(5)
  const upcomingPayments = useUpcomingPayments(3)

  return {
    stats: stats.data,
    activities: activities.data || [],
    upcomingPayments: upcomingPayments.data || [],
    isLoading: stats.isLoading || activities.isLoading || upcomingPayments.isLoading,
    isError: stats.isError || activities.isError || upcomingPayments.isError,
    error: stats.error || activities.error || upcomingPayments.error,
    refetch: () => {
      stats.refetch()
      activities.refetch()
      upcomingPayments.refetch()
    },
  }
}
