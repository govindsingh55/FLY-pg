'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { toast } from 'sonner'
import {
  ArrowLeftIcon,
  DownloadIcon,
  CalendarIcon,
  CreditCardIcon,
  ReceiptIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
} from 'lucide-react'

interface PaymentDetails {
  id: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  paymentMethodDetails?: {
    cardLast4?: string
    cardBrand?: string
    upiId?: string
    bankName?: string
  }
  dueDate: string
  paidDate?: string
  description: string
  lateFees?: number
  utilityCharges?: number
  receiptUrl?: string
  transactionId?: string
  bookingId?: string
  bookingDetails?: {
    propertyName: string
    roomNumber: string
    checkInDate: string
    checkOutDate: string
  }
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.id as string

  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingReceipt, setDownloadingReceipt] = useState(false)

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/custom/customers/payments/${paymentId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Payment not found')
        }
        throw new Error('Failed to fetch payment details')
      }

      const data = await response.json()
      setPayment(data.payment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment details')
      toast.error('Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails()
    }
  }, [paymentId])

  const handleDownloadReceipt = async () => {
    if (!payment?.receiptUrl) {
      toast.error('Receipt not available')
      return
    }

    try {
      setDownloadingReceipt(true)
      const response = await fetch(`/api/custom/customers/payments/${paymentId}/receipt`)

      if (!response.ok) {
        throw new Error('Failed to download receipt')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payment-receipt-${paymentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Receipt downloaded successfully')
    } catch (err) {
      toast.error('Failed to download receipt')
    } finally {
      setDownloadingReceipt(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: ClockIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        text: 'Pending',
      },
      completed: {
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        text: 'Completed',
      },
      failed: {
        icon: XCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        text: 'Failed',
      },
      refunded: {
        icon: AlertCircleIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        text: 'Refunded',
      },
    }

    return configs[status as keyof typeof configs] || configs.pending
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Payment not found'}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = getStatusConfig(payment.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Payments
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Details</h1>
            <p className="text-gray-600">Transaction ID: {payment.transactionId || payment.id}</p>
          </div>

          <div className="flex items-center gap-3">
            {payment.receiptUrl && (
              <Button
                onClick={handleDownloadReceipt}
                disabled={downloadingReceipt}
                className="flex items-center gap-2"
              >
                <DownloadIcon className="h-4 w-4" />
                {downloadingReceipt ? 'Downloading...' : 'Download Receipt'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}
                >
                  <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                </div>
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                    {statusConfig.text}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="flex items-center gap-2">
                    <CreditCardIcon className="h-4 w-4 text-gray-400" />
                    {payment.paymentMethod}
                    {payment.paymentMethodDetails?.cardLast4 && (
                      <span className="text-sm text-gray-500">
                        •••• {payment.paymentMethodDetails.cardLast4}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Due Date</label>
                    <p className="text-gray-900">{formatDate(payment.dueDate)}</p>
                  </div>

                  {payment.paidDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Paid Date</label>
                      <p className="text-gray-900">{formatDate(payment.paidDate)}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{payment.description}</p>
                </div>

                {payment.notes && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Notes</label>
                      <p className="text-gray-900">{payment.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          {payment.bookingDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Property</label>
                      <p className="text-gray-900">{payment.bookingDetails.propertyName}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Room Number</label>
                      <p className="text-gray-900">{payment.bookingDetails.roomNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Check-in Date</label>
                      <p className="text-gray-900">
                        {formatDate(payment.bookingDetails.checkInDate)}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Check-out Date</label>
                      <p className="text-gray-900">
                        {formatDate(payment.bookingDetails.checkOutDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Charges Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Charges Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Rent</span>
                  <span className="text-gray-900">
                    {formatCurrency(
                      payment.amount - (payment.lateFees || 0) - (payment.utilityCharges || 0),
                    )}
                  </span>
                </div>

                {payment.lateFees && payment.lateFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Late Fees</span>
                    <span className="text-red-600">{formatCurrency(payment.lateFees)}</span>
                  </div>
                )}

                {payment.utilityCharges && payment.utilityCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utility Charges</span>
                    <span className="text-gray-900">{formatCurrency(payment.utilityCharges)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Created</p>
                    <p className="text-xs text-gray-500">{formatDateTime(payment.createdAt)}</p>
                  </div>
                </div>

                {payment.paidDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payment Completed</p>
                      <p className="text-xs text-gray-500">{formatDateTime(payment.paidDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDateTime(payment.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
