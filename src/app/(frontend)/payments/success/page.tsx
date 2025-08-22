import { getPayload } from 'payload'
import config from '@payload-config'

// /payments/success?paymentId=...&bookingId=...
export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { paymentId?: string; bookingId?: string }
}) {
  const payload = await getPayload({ config })
  const paymentId = searchParams.paymentId
  const bookingId = searchParams.bookingId

  // Optional fetch of latest payment/booking for display; safe to fail.
  let payment: any = null
  let booking: any = null
  try {
    if (paymentId) {
      const payRes: any = await (payload as any).find({
        collection: 'payments',
        where: { id: { equals: paymentId } },
        depth: 0,
        limit: 1,
      })
      payment = payRes?.docs?.[0] || null
    }
  } catch {}
  try {
    if (bookingId) {
      const bookRes: any = await (payload as any).find({
        collection: 'bookings',
        where: { id: { equals: bookingId } },
        depth: 0,
        limit: 1,
      })
      booking = bookRes?.docs?.[0] || null
    }
  } catch {}

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-green-600">Payment successful</h1>
      <p className="mt-2 text-muted-foreground">
        Thanks for your payment. Your booking is recorded.
      </p>
      <div className="mt-6 rounded-md border p-4 text-sm">
        <div className="font-medium mb-2">Details</div>
        <div>
          Payment ID:{' '}
          <span className="text-muted-foreground">{paymentId || payment?.id || '-'}</span>
        </div>
        <div>
          Booking ID:{' '}
          <span className="text-muted-foreground">{bookingId || booking?.id || '-'}</span>
        </div>
        <div>
          Status: <span className="text-muted-foreground">{payment?.status || 'completed'}</span>
        </div>
        <div>
          Amount:{' '}
          <span className="text-muted-foreground">
            ₹{Number(payment?.amount || booking?.price || 0).toLocaleString()}
          </span>
        </div>
      </div>
      {/*
        This page is for development.
        In production, you should validate signatures (PhonePe) and show an authoritative status.
      */}
    </div>
  )
}
