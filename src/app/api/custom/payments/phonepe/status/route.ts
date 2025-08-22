import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { phonePeCheckStatus } from '@/lib/payments/phonepe'

// GET /api/custom/payments/phonepe/status?paymentId=xxx
// In production, you may check PhonePe order status and reconcile with local DB.
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(req.url)
    const paymentId = searchParams.get('paymentId')
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    const paymentRes: any = await (payload as any).find({
      collection: 'payments',
      where: { id: { equals: paymentId } },
      depth: 0,
      limit: 1,
    })
    const payment = paymentRes?.docs?.[0]
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    // If you have stored merchantTransactionId, use it, else reconstruct
    const merchantTransactionId = `BOOK-${payment.id}`
    const status = await phonePeCheckStatus(merchantTransactionId)

    // Optionally reconcile local state on success
    try {
      await (payload as any).update({
        collection: 'payments',
        id: payment.id,
        data: {
          phonepeLastCode: status.code,
          phonepeLastState: status.state,
          phonepeLastRaw: status.raw,
          ...(status.success && status.state === 'PAYMENT_SUCCESS' && payment.status !== 'completed'
            ? { status: 'completed', paymentDate: new Date().toISOString() }
            : {}),
        },
        overrideAccess: true,
      })
    } catch {}

    return NextResponse.json({ success: status.success, state: status.state, raw: status.raw })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
