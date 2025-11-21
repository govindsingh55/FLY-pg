'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StaffRole } from '@/lib/constants/staff-roles'

export const dynamic = 'force-dynamic'

interface StaffUser {
  id: string
  email: string
  name: string
  role: StaffRole
}

interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  myAssigned: number
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: number
  color: 'blue' | 'yellow' | 'green' | 'purple' | 'gray'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    gray: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  )
}

export default function StaffDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<StaffUser | null>(null)
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const userRes = await fetch('/api/custom/staff/me')
        if (!userRes.ok) {
          router.push('/staff/login')
          return
        }
        const userData = await userRes.json()
        setUser(userData.user)

        // Fetch ticket stats
        const statsRes = await fetch('/api/custom/staff/support/tickets/stats')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.name}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your support tickets and help customers resolve their issues.
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Tickets" value={stats.total} color="gray" />
          <StatCard title="Open" value={stats.open} color="yellow" />
          <StatCard title="In Progress" value={stats.inProgress} color="blue" />
          <StatCard title="Resolved" value={stats.resolved} color="green" />
          <StatCard title="Closed" value={stats.closed} color="gray" />
          <StatCard title="My Assigned" value={stats.myAssigned} color="purple" />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/staff/tickets"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                View All Tickets
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse and manage support tickets
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/staff/tickets?filter=unassigned"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-green-500"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Claim New Tickets
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View unassigned tickets you can claim
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
