'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaymentCard } from '@/components/dashboard/PaymentCard'
import { CreditCard, Filter, Search, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

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

export default function RentPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  })
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'paymentDate',
    sortOrder: 'desc',
    search: '',
  })

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/custom/customers/payments?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }

      const data: PaymentsResponse = await response.json()
      setPayments(data.payments)
      setPagination(data.pagination)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  // Handle initial load
  useEffect(() => {
    fetchPayments()
  }, [])

  // Handle filter changes
  useEffect(() => {
    if (pagination) {
      fetchPayments()
    }
  }, [filters])

  // Handle pagination changes (but not on initial load)
  useEffect(() => {
    if (pagination && pagination.page > 1) {
      fetchPayments()
    }
  }, [pagination?.page])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleRefresh = () => {
    fetchPayments()
  }

  const pendingPayments = (payments || []).filter((p) => p.status === 'pending')
  const overduePayments = pendingPayments.filter(
    (p) => p.dueDate && new Date(p.dueDate) < new Date(),
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rent & Payments</h1>
          <p className="text-muted-foreground">
            Manage your rent payments and view payment history
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/rent/settings">
              <CreditCard className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/rent/payments">
              <CreditCard className="mr-2 h-4 w-4" />
              View All Payments
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">All time payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats?.totalAmount || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Successfully paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Badge variant="secondary" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.failed || 0}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overduePayments.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertCircle className="mr-2 h-5 w-5" />
              Overdue Payments
            </CardTitle>
            <CardDescription className="text-red-700">
              You have {overduePayments.length} overdue payment
              {overduePayments.length !== 1 ? 's' : ''} that require immediate attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {overduePayments.slice(0, 3).map((payment) => (
                <PaymentCard key={payment.id} payment={payment} showActions={true} />
              ))}
            </div>
            {overduePayments.length > 3 && (
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/rent/payments?status=pending">
                    View All Overdue Payments
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paymentDate">Payment Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Your latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (payments || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {filters.status !== 'all' || filters.search
                  ? 'Try adjusting your filters to see more results.'
                  : "You haven't made any payments yet."}
              </p>
              <Button asChild>
                <Link href="/properties">Browse Properties</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(payments || []).map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {((pagination.page || 1) - 1) * (pagination.limit || 10) + 1} to{' '}
                    {Math.min(
                      (pagination.page || 1) * (pagination.limit || 10),
                      pagination.totalDocs || 0,
                    )}{' '}
                    of {pagination.totalDocs || 0} payments
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((pagination.page || 1) - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page || 1} of {pagination.totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((pagination.page || 1) + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
