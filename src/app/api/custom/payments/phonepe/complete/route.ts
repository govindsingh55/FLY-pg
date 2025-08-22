import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// POST /api/custom/payments/phonepe/complete
// Dev-only: This simulates completing a payment.
// Production: You should update status via callback/redirect handler and webhook with signature verification.
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { paymentId } = await req.json()
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    // Mark payment as completed
    const payment: any = await (payload as any).update({
      collection: 'payments',
      id: paymentId,
      data: { status: 'completed', paymentDate: new Date().toISOString() },
      overrideAccess: true,
    })

    // Also mark associated booking as confirmed (if linked)
    // Note: payments.payfor relates to 'bookings'
    try {
      const bookingId = typeof payment?.payfor === 'string' ? payment.payfor : payment?.payfor?.id
      if (bookingId) {
        await (payload as any).update({
          collection: 'bookings',
          id: bookingId,
          data: { status: 'confirmed' },
          overrideAccess: true,
        })
      }
    } catch {}

    return NextResponse.json({ success: true, payment })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
