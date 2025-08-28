'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Home,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLoading } from '@/hooks/useLoading'
import { useRouter } from 'next/navigation'

interface RentSummaryData {
  currentMonth: {
    totalRent: number
    paidAmount: number
    pendingAmount: number
    dueDate: string
    daysRemaining: number
    isOverdue: boolean
    lateFees: number
  }
  upcomingPayments: Array<{
    month: string
    amount: number
    dueDate: string
    daysUntilDue: number
  }>
  financialSummary: {
    totalPaid: number
    totalPending: number
    totalOverdue: number
    averageMonthlyRent: number
    paymentHistory: Array<{
      month: string
      amount: number
      status: 'paid' | 'pending' | 'overdue'
    }>
  }
  properties: Array<{
    id: string
    name: string
    roomName: string
    monthlyRent: number
    status: 'active' | 'inactive'
    nextPaymentDate: string
  }>
}

interface RentSummaryProps {
  className?: string
}

export function RentSummary({ className }: RentSummaryProps) {
  const [summaryData, setSummaryData] = useState<RentSummaryData | null>(null)
  const { isLoading, withLoading } = useLoading()
  const router = useRouter()

  const fetchRentSummary = async () => {
    try {
      const response = await fetch('/api/custom/customers/rent/summary')
      if (!response.ok) {
        throw new Error('Failed to fetch rent summary')
      }
      const data = await response.json()
      setSummaryData(data)
    } catch (error) {
      console.error('Error fetching rent summary:', error)
      toast.error('Failed to load rent summary')
    }
  }

  useEffect(() => {
    withLoading(fetchRentSummary)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDaysRemainingColor = (days: number, isOverdue: boolean) => {
    if (isOverdue) return 'text-red-600'
    if (days <= 3) return 'text-orange-600'
    if (days <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getPaymentProgress = (paid: number, total: number) => {
    return total > 0 ? (paid / total) * 100 : 0
  }

  const handleMakePayment = async () => {
    if (!summaryData?.currentMonth) {
      toast.error('No payment data available')
      return
    }

    try {
      // Create a new payment record for the current month
      const response = await fetch('/api/custom/customers/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: summaryData.currentMonth.pendingAmount + summaryData.currentMonth.lateFees,
          description: `Rent payment for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
          dueDate: summaryData.currentMonth.dueDate,
          paymentMethod: 'phonepe',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment')
      }

      const { payment } = await response.json()

      // Initiate PhonePe payment using the general payments route
      const phonePeResponse = await fetch('/api/custom/customers/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: summaryData.currentMonth.pendingAmount + summaryData.currentMonth.lateFees,
          bookingId: summaryData.properties[0]?.id, // Use the first active property's booking ID
          paymentMethod: 'upi',
          paymentForMonthAndYear: new Date().toISOString().slice(0, 7), // YYYY-MM format
          description: `Rent payment for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        }),
      })

      if (!phonePeResponse.ok) {
        throw new Error('Failed to initiate payment')
      }

      const { redirectUrl } = await phonePeResponse.json()

      if (redirectUrl) {
        // Redirect to PhonePe payment page
        window.location.href = redirectUrl
      } else {
        toast.error('Payment initiation failed')
      }
    } catch (error) {
      console.error('Error making payment:', error)
      toast.error('Failed to initiate payment')
    }
  }

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <CardTitle>Loading Rent Summary...</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!summaryData) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Unable to load rent summary</p>
              <Button onClick={fetchRentSummary} variant="outline" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { currentMonth, upcomingPayments, financialSummary, properties } = summaryData

  return (
    <div className={className}>
      {/* Current Month Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Current Month Overview
              </CardTitle>
              <CardDescription>
                Rent payment status for{' '}
                {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </div>
            <Button onClick={fetchRentSummary} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Rent */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Total Rent
              </div>
              <div className="text-2xl font-bold">{formatCurrency(currentMonth.totalRent)}</div>
            </div>

            {/* Paid Amount */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Paid Amount
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(currentMonth.paidAmount)}
              </div>
            </div>

            {/* Pending Amount */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pending Amount
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(currentMonth.pendingAmount)}
              </div>
            </div>

            {/* Days Remaining */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {currentMonth.isOverdue ? 'Days Overdue' : 'Days Remaining'}
              </div>
              <div
                className={`text-2xl font-bold ${getDaysRemainingColor(currentMonth.daysRemaining, currentMonth.isOverdue)}`}
              >
                {Math.abs(currentMonth.daysRemaining)}
              </div>
            </div>
          </div>

          {/* Payment Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Payment Progress</span>
              <span>
                {getPaymentProgress(currentMonth.paidAmount, currentMonth.totalRent).toFixed(1)}%
              </span>
            </div>
            <Progress
              value={getPaymentProgress(currentMonth.paidAmount, currentMonth.totalRent)}
              className="h-2"
            />
          </div>

          {/* Due Date and Late Fees */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Due Date
              </div>
              <div className="mt-1 text-lg font-semibold">{formatDate(currentMonth.dueDate)}</div>
            </div>
            {currentMonth.lateFees > 0 && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Late Fees
                </div>
                <div className="mt-1 text-lg font-semibold text-red-600">
                  {formatCurrency(currentMonth.lateFees)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Financial Summary
            </CardTitle>
            <CardDescription>Your overall rent payment statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-green-50 p-3">
                <div className="text-sm text-green-600">Total Paid</div>
                <div className="text-lg font-semibold text-green-700">
                  {formatCurrency(financialSummary.totalPaid)}
                </div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3">
                <div className="text-sm text-yellow-600">Total Pending</div>
                <div className="text-lg font-semibold text-yellow-700">
                  {formatCurrency(financialSummary.totalPending)}
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <div className="text-sm text-red-600">Total Overdue</div>
              <div className="text-lg font-semibold text-red-700">
                {formatCurrency(financialSummary.totalOverdue)}
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="text-sm text-blue-600">Average Monthly Rent</div>
              <div className="text-lg font-semibold text-blue-700">
                {formatCurrency(financialSummary.averageMonthlyRent)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Payments
            </CardTitle>
            <CardDescription>Next few months&apos; rent schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingPayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{payment.month}</div>
                    <div className="text-sm text-muted-foreground">
                      Due: {formatDate(payment.dueDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                    <div
                      className={`text-sm ${getDaysRemainingColor(payment.daysUntilDue, false)}`}
                    >
                      {payment.daysUntilDue} days
                    </div>
                  </div>
                </div>
              ))}
              {upcomingPayments.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No upcoming payments</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Properties & Rent Details
          </CardTitle>
          <CardDescription>Your current properties and their rent information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{property.name}</div>
                    <div className="text-sm text-muted-foreground">{property.roomName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(property.monthlyRent)}</div>
                  <div className="text-sm text-muted-foreground">
                    Next: {formatDate(property.nextPaymentDate)}
                  </div>
                  <Badge
                    variant={property.status === 'active' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {property.status}
                  </Badge>
                </div>
              </div>
            ))}
            {properties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No properties found</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={handleMakePayment} disabled={currentMonth.pendingAmount === 0}>
          <CreditCard className="mr-2 h-4 w-4" />
          {currentMonth.pendingAmount === 0 ? 'No Payment Due' : 'Make Payment'}
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/rent/payments')}>
          <Calendar className="mr-2 h-4 w-4" />
          View Payment History
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/rent/settings')}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Payment Settings
        </Button>
      </div>
    </div>
  )
}
