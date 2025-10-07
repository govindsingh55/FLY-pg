'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  CheckCircle,
  CreditCard,
  Home,
  TrendingUp,
  User,
  RefreshCw,
  AlertCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { useDashboardData } from '@/hooks/useDashboard'

export default function DashboardPage() {
  // Use React Query hook - handles loading, error, caching automatically
  const { stats, activities, upcomingPayments, isLoading, isError, error, refetch } =
    useDashboardData()

  // Handle refresh
  const handleRefresh = async () => {
    await refetch()
    toast.success('Dashboard refreshed successfully')
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Helper function to get payment status display
  const getPaymentStatusDisplay = () => {
    if (!stats) return { text: 'Loading...', icon: CheckCircle, color: 'text-gray-600' }

    switch (stats.paymentStatus) {
      case 'up_to_date':
        return {
          text: 'Up to date',
          subtext: 'No pending payments',
          icon: CheckCircle,
          color: 'text-green-600',
        }
      case 'pending':
        return {
          text: 'Payment pending',
          subtext: `${stats.pendingPaymentsCount} payment${stats.pendingPaymentsCount !== 1 ? 's' : ''} due`,
          icon: Clock,
          color: 'text-yellow-600',
        }
      case 'overdue':
        return {
          text: 'Payment overdue',
          subtext: `${stats.overduePaymentsCount} overdue payment${stats.overduePaymentsCount !== 1 ? 's' : ''}`,
          icon: XCircle,
          color: 'text-red-600',
        }
      default:
        return { text: 'Unknown', icon: AlertCircle, color: 'text-gray-600' }
    }
  }

  // Helper function to get activity icon color
  const getActivityIconColor = (type: string, status?: string) => {
    if (type === 'payment') {
      if (status === 'completed') return 'bg-green-600'
      if (status === 'failed') return 'bg-red-600'
      return 'bg-yellow-600'
    }
    if (type === 'booking') return 'bg-blue-600'
    if (type === 'extension') return 'bg-purple-600'
    if (type === 'maintenance') return 'bg-orange-600'
    return 'bg-gray-600'
  }

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Page header skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-muted rounded w-40 animate-pulse"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error instanceof Error ? error.message : 'Failed to load dashboard data'}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const paymentStatusDisplay = getPaymentStatusDisplay()
  const StatusIcon = paymentStatusDisplay.icon

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your account.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              View Bookings
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 sm:p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold">{stats?.activeBookingsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeBookingsCount === 0
                ? 'No active bookings'
                : `${stats?.activeBookingsCount} active booking${stats?.activeBookingsCount !== 1 ? 's' : ''}`}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold">
              {stats?.monthlyRent ? formatCurrency(stats.monthlyRent) : '₹0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.daysUntilPayment !== null && stats?.daysUntilPayment !== undefined
                ? stats.daysUntilPayment > 0
                  ? `Due in ${stats.daysUntilPayment} day${stats.daysUntilPayment !== 1 ? 's' : ''}`
                  : stats.daysUntilPayment === 0
                    ? 'Due today'
                    : `Overdue by ${Math.abs(stats.daysUntilPayment)} day${Math.abs(stats.daysUntilPayment) !== 1 ? 's' : ''}`
                : 'No upcoming payments'}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <StatusIcon className={`h-4 w-4 ${paymentStatusDisplay.color}`} />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold">{paymentStatusDisplay.text}</div>
            <p className="text-xs text-muted-foreground">{paymentStatusDisplay.subtext}</p>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold">
              {stats?.totalSpent ? formatCurrency(stats.totalSpent) : '₹0'}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions and alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/dashboard/profile">
                  <User className="mb-2 h-6 w-6" />
                  Update Profile
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/dashboard/rent">
                  <CreditCard className="mb-2 h-6 w-6" />
                  Pay Rent
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/dashboard/bookings">
                  <Calendar className="mb-2 h-6 w-6" />
                  View Bookings
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/dashboard/settings">
                  <User className="mb-2 h-6 w-6" />
                  Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div
                      className={`h-2 w-2 rounded-full ${getActivityIconColor(activity.type, activity.status)}`}
                    ></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                    {activity.amount && (
                      <Badge variant="secondary">{formatCurrency(activity.amount)}</Badge>
                    )}
                    {activity.status && !activity.amount && (
                      <Badge variant="outline" className="capitalize">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming payments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Your scheduled payments and due dates</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingPayments.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="font-medium">No upcoming payments</p>
              <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`flex flex-col gap-4 p-4 border rounded-lg sm:flex-row sm:items-center sm:justify-between ${
                    payment.isOverdue ? 'border-red-200 bg-red-50/50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        payment.isOverdue ? 'bg-red-100' : 'bg-primary/10'
                      }`}
                    >
                      <CreditCard
                        className={`h-5 w-5 ${payment.isOverdue ? 'text-red-600' : 'text-primary'}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">Monthly Rent</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.room.name}, {payment.property.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end sm:gap-0">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.totalAmount)}</p>
                      <p
                        className={`text-sm ${payment.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}
                      >
                        {payment.isOverdue
                          ? `Overdue by ${Math.abs(payment.daysUntilDue)} day${Math.abs(payment.daysUntilDue) !== 1 ? 's' : ''}`
                          : payment.daysUntilDue === 0
                            ? 'Due today'
                            : `Due in ${payment.daysUntilDue} day${payment.daysUntilDue !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <Button size="lg" variant={payment.isOverdue ? 'destructive' : 'default'}>
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
