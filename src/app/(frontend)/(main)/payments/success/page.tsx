import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { RefreshStatusButton } from './RefreshStatusButton'

// Payment success/failure page - handles PhonePe redirects
export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await searchParams to fix Next.js async issue
  const params = await searchParams

  // Initialize payload (optional - for fetching payment details)
  const payload = await getPayload({ config })

  const paymentId = params.paymentId as string

  let payment = await payload.findByID({
    collection: 'payments',
    id: paymentId,
  })

  if (!payment || payment.status === 'failed') {
    return <div>Payment failed</div>
  }

  if (payment.status === 'initiated') {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/custom/payments/phonepe/status?paymentId=${paymentId}`,
      {
        cache: 'no-store',
      },
    )
    const data = await res.json()
    if (data.success) {
      payment = data.payment
    }
  }
  const isSuccess = payment.status === 'completed'
  const isFailed = payment.status === 'failed'
  const isProcessing = payment.status === 'processing'
  const isInitiated = payment.status === 'initiated'
  const isPending = payment.status === 'pending'
  const isCancelled = payment.status === 'cancelled'
  const isRefunded = payment.status === 'refunded'
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-16">
        {isSuccess ? (
          <>
            <h1 className="text-2xl font-semibold text-green-600">Payment Successful!</h1>
            <p className="mt-2 text-muted-foreground">
              Thanks for your payment. Your booking has been confirmed.
            </p>

            <div className="mt-6 rounded-md border p-4 text-sm">
              <div className="font-medium mb-2">Payment Details</div>
              <div>
                Payment ID:{' '}
                <span className="text-muted-foreground">{paymentId || payment?.id || '-'}</span>
              </div>
              <div>
                Status:{' '}
                <span className="text-muted-foreground">{payment?.status || 'completed'}</span>
              </div>
              <div>
                Amount:{' '}
                <span className="text-muted-foreground">
                  ₹{Number(payment?.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/dashboard/bookings"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View My Bookings
              </Link>
            </div>
          </>
        ) : isFailed ? (
          <>
            <h1 className="text-2xl font-semibold text-red-600">Payment Failed</h1>
            <p className="mt-2 text-muted-foreground">
              Unfortunately, your payment could not be processed. Please try again.
            </p>

            <div className="mt-6 rounded-md border p-4 text-sm">
              <div className="font-medium mb-2">Payment Details</div>
              <div>
                Payment ID:{' '}
                <span className="text-muted-foreground">{paymentId || payment?.id || '-'}</span>
              </div>
              <div>
                Status: <span className="text-muted-foreground">{payment?.status || 'failed'}</span>
              </div>
              <div>
                Amount:{' '}
                <span className="text-muted-foreground">
                  ₹{Number(payment?.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/properties"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-yellow-600">Payment Processing</h1>
            <p className="mt-2 text-muted-foreground">
              Your payment is being processed. Please wait while we confirm your booking.
            </p>

            <div className="mt-6 rounded-md border p-4 text-sm">
              <div className="font-medium mb-2">Payment Details</div>
              <div>
                Payment ID:{' '}
                <span className="text-muted-foreground">{paymentId || payment?.id || '-'}</span>
              </div>
              <div>
                Status:{' '}
                <span className="text-muted-foreground">{payment?.status || 'processing'}</span>
              </div>
              <div>
                Amount:{' '}
                <span className="text-muted-foreground">
                  ₹{Number(payment?.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <RefreshStatusButton paymentId={paymentId || ''} />
              <Link
                href="/dashboard/bookings"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
              >
                Check Bookings
              </Link>
              <Link
                href="/properties"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Browse Properties
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
