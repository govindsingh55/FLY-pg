'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface PaymentStatusCheckerProps {
  paymentId: string
  bookingId?: string
}

type PaymentStatus = 'initiated' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

interface PaymentData {
  id: string
  status: PaymentStatus
  amount: number
  paymentDate?: string
  merchantOrderId?: string
}

export function PaymentStatusChecker({ paymentId, bookingId }: PaymentStatusCheckerProps) {
  const router = useRouter()
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [autoRefreshing, setAutoRefreshing] = useState(false)

  // Exponential backoff intervals: 0s, 2s, 5s, 10s, 20s, 30s, 45s, 60s
  const getNextPollInterval = (count: number): number => {
    const intervals = [0, 2000, 5000, 10000, 20000, 30000, 45000, 60000]
    return intervals[Math.min(count, intervals.length - 1)]
  }

  const checkPaymentStatus = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true)
      setError(null)

      const response = await fetch(`/api/custom/customers/payments/${paymentId}/status`, {
        cache: 'no-store',
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - redirect to login
          router.push(`/login?redirect=/payments/success?paymentId=${paymentId}`)
          return
        }
        throw new Error(`Failed to check status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.payment) {
        setPayment(data.payment)

        // Stop polling if we have a final status
        if (data.payment.status === 'completed' || data.payment.status === 'failed') {
          setAutoRefreshing(false)
        }
      } else {
        throw new Error(data.error || 'Failed to get payment status')
      }
    } catch (err) {
      console.error('Error checking payment status:', err)
      setError(err instanceof Error ? err.message : 'Failed to check status')
      setAutoRefreshing(false)
    } finally {
      setLoading(false)
    }
  }

  // Initial check and polling setup
  useEffect(() => {
    checkPaymentStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId])

  // Auto-refresh polling effect
  useEffect(() => {
    if (!payment) return

    // Start auto-refresh for non-final statuses
    if (
      payment.status === 'initiated' ||
      payment.status === 'pending' ||
      payment.status === 'processing'
    ) {
      setAutoRefreshing(true)
    }

    // Stop polling after 12 attempts (about 2 minutes)
    if (autoRefreshing && pollCount < 12) {
      const interval = getNextPollInterval(pollCount)
      const timeoutId = setTimeout(() => {
        setPollCount((c) => c + 1)
        checkPaymentStatus(true)
      }, interval)

      return () => clearTimeout(timeoutId)
    }

    if (pollCount >= 12) {
      setAutoRefreshing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.status, autoRefreshing, pollCount])

  const handleManualRefresh = () => {
    setPollCount(0)
    setAutoRefreshing(true)
    checkPaymentStatus()
  }

  if (loading && !payment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Checking payment status...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !payment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <h1 className="text-2xl font-semibold text-destructive">Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <div className="mt-6">
            <Button onClick={handleManualRefresh}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!payment) return null

  const isSuccess = payment.status === 'completed'
  const isFailed = payment.status === 'failed' || payment.status === 'cancelled'

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16">
        {isSuccess ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-primary">Payment Successful!</h1>
            </div>
            <p className="mt-2 text-muted-foreground">
              Thanks for your payment. Your booking has been confirmed.
            </p>

            <div className="mt-6 rounded-md border bg-card p-4 text-sm">
              <div className="font-medium mb-3">Payment Details</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID:</span>
                  <span className="font-mono text-xs">{payment.id}</span>
                </div>
                {bookingId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking ID:</span>
                    <span className="font-mono text-xs">{bookingId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-primary font-medium capitalize">{payment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    ₹{Number(payment.amount || 0).toLocaleString()}
                  </span>
                </div>
                {payment.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{new Date(payment.paymentDate).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/bookings">View My Bookings</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/properties">Browse Properties</Link>
              </Button>
            </div>
          </>
        ) : isFailed ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-destructive">Payment Failed</h1>
            </div>
            <p className="mt-2 text-muted-foreground">
              Unfortunately, your payment could not be processed. Please try again.
            </p>

            <div className="mt-6 rounded-md border bg-card p-4 text-sm">
              <div className="font-medium mb-3">Payment Details</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID:</span>
                  <span className="font-mono text-xs">{payment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-destructive font-medium capitalize">{payment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    ₹{Number(payment.amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/properties">Try Again</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent"></div>
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Payment Processing</h1>
            </div>
            <p className="mt-2 text-muted-foreground">
              Your payment is being processed. Please wait while we confirm your booking.
              {autoRefreshing && (
                <span className="block mt-1 text-sm">Auto-refreshing status...</span>
              )}
            </p>

            <div className="mt-6 rounded-md border bg-card p-4 text-sm">
              <div className="font-medium mb-3">Payment Details</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID:</span>
                  <span className="font-mono text-xs">{payment.id}</span>
                </div>
                {bookingId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking ID:</span>
                    <span className="font-mono text-xs">{bookingId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-accent-foreground font-medium capitalize">
                    {payment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    ₹{Number(payment.amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleManualRefresh} disabled={loading}>
                {loading ? 'Checking...' : 'Refresh Status'}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/bookings">Check Bookings</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/properties">Browse Properties</Link>
              </Button>
            </div>

            {pollCount >= 12 && (
              <div className="mt-4 rounded-md bg-accent/20 border border-accent/30 p-4 text-sm">
                <p className="font-medium mb-2">Payment is taking longer than expected</p>
                <p className="text-muted-foreground">You can:</p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Click &quot;Refresh Status&quot; to check again</li>
                  <li>Check your bookings dashboard later</li>
                  <li>Contact support if the issue persists</li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
