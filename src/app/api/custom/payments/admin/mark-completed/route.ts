import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { paymentId } = await req.json()
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    const updated = await (payload as any).update({
      collection: 'payments',
      id: paymentId,
      data: { status: 'completed', paymentDate: new Date().toISOString() },
      overrideAccess: true,
    })

    try {
      const bookingId =
        typeof (updated as any)?.payfor === 'string'
          ? (updated as any).payfor
          : (updated as any)?.payfor?.id
      if (bookingId) {
        await (payload as any).update({
          collection: 'bookings',
          id: bookingId,
          data: { status: 'confirmed' },
          overrideAccess: true,
        })
      }
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
