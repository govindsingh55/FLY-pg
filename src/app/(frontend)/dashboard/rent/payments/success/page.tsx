'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  DownloadIcon,
  HomeIcon,
} from 'lucide-react'

interface PaymentStatus {
  id: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount: number
  description: string
  transactionId?: string
  paidDate?: string
  receiptUrl?: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [payment, setPayment] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingReceipt, setDownloadingReceipt] = useState(false)

  const paymentId = searchParams.get('paymentId')
  const transactionId = searchParams.get('transactionId')

  const fetchPaymentStatus = async () => {
    if (!paymentId) {
      setError('Payment ID not found')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/custom/customers/payments/${paymentId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch payment status')
      }

      const data = await response.json()
      setPayment(data.payment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment status')
      toast.error('Failed to load payment status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Add a small delay to allow PhonePe callback to process
    const timer = setTimeout(() => {
      fetchPaymentStatus()
    }, 2000)

    return () => clearTimeout(timer)
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
        text: 'Payment Pending',
        description: 'Your payment is being processed. Please wait a moment.',
      },
      completed: {
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        text: 'Payment Successful',
        description: 'Your payment has been completed successfully.',
      },
      failed: {
        icon: XCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        text: 'Payment Failed',
        description: 'Your payment could not be processed. Please try again.',
      },
      refunded: {
        icon: XCircleIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        text: 'Payment Refunded',
        description: 'Your payment has been refunded.',
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Processing your payment...</p>
          </div>
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
              <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
              <p className="text-red-600 mb-4">{error || 'Payment not found'}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/dashboard/rent')}>
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border mb-4`}
          >
            <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{statusConfig.text}</h1>
          <p className="text-gray-600">{statusConfig.description}</p>
        </div>

        {/* Payment Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(payment.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                  {statusConfig.text}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Description</span>
                <span className="text-gray-900">{payment.description}</span>
              </div>

              {transactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="text-sm text-gray-500 font-mono">{transactionId}</span>
                </div>
              )}

              {payment.paidDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Paid Date</span>
                  <span className="text-gray-900">{formatDate(payment.paidDate)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {payment.status === 'completed' && payment.receiptUrl && (
            <Button
              onClick={handleDownloadReceipt}
              disabled={downloadingReceipt}
              className="flex items-center gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              {downloadingReceipt ? 'Downloading...' : 'Download Receipt'}
            </Button>
          )}

          <Button
            onClick={() => router.push('/dashboard/rent')}
            className="flex items-center gap-2"
          >
            <HomeIcon className="h-4 w-4" />
            Go to Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/rent/payments')}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            View All Payments
          </Button>
        </div>

        {/* Additional Information */}
        {payment.status === 'pending' && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Your payment is being processed. This may take a few minutes.
                </p>
                <Button variant="outline" size="lg" onClick={fetchPaymentStatus}>
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {payment.status === 'failed' && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  If you believe this is an error, please contact support.
                </p>
                <Button variant="outline" size="lg" onClick={() => router.push('/dashboard/rent')}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
