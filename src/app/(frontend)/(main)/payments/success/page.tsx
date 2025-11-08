import { PaymentStatusChecker } from './PaymentStatusChecker'

// Payment success/failure page - handles PhonePe redirects
// Now fully client-side to handle authentication properly and enable status polling
export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await searchParams to fix Next.js async issue
  const params = await searchParams

  const paymentId = params.paymentId as string
  const bookingId = params.bookingId as string | undefined

  if (!paymentId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <h1 className="text-2xl font-semibold text-red-600">Invalid Request</h1>
          <p className="mt-2 text-muted-foreground">Missing payment ID</p>
        </div>
      </div>
    )
  }

  return <PaymentStatusChecker paymentId={paymentId} bookingId={bookingId} />
}
