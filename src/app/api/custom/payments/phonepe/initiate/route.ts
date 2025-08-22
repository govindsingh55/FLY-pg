import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { phonePeCreatePayment } from '@/lib/payments/phonepe'

// POST /api/custom/payments/phonepe/initiate
// Input: { paymentId }
// Output: { success, redirectUrl?, instrument?, error? }
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { paymentId } = await req.json()
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    const paymentRes: any = await (payload as any).find({
      collection: 'payments',
      where: { id: { equals: paymentId } },
      depth: 0,
      limit: 1,
    })
    const payment = paymentRes?.docs?.[0]
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
    if (!siteUrl) return NextResponse.json({ error: 'Missing SITE_URL' }, { status: 500 })

    const merchantTransactionId = `BOOK-${payment.id}`
    const merchantUserId =
      typeof payment.customer === 'string' ? payment.customer : payment.customer?.id
    const amountPaise = Math.round(Number(payment.amount) * 100)

    const redirectUrl = `${siteUrl}/payments/success?paymentId=${encodeURIComponent(payment.id)}&bookingId=${encodeURIComponent(
      typeof payment.payfor === 'string' ? payment.payfor : payment.payfor?.id || '',
    )}`
    const callbackUrl = `${siteUrl}/api/custom/payments/phonepe/callback`

    const result = await phonePeCreatePayment({
      amountPaise,
      merchantTransactionId,
      merchantUserId,
      redirectUrl,
      callbackUrl,
    })

    // Optional: persist transaction id / state if returned
    try {
      if (result?.raw?.data?.merchantTransactionId || result?.raw?.data?.transactionId) {
        await (payload as any).update({
          collection: 'payments',
          id: payment.id,
          data: {
            gateway: 'phonepe',
            phonepeMerchantTransactionId:
              result?.raw?.data?.merchantTransactionId || merchantTransactionId,
            phonepeTransactionId: result?.raw?.data?.transactionId,
          },
          overrideAccess: true,
        })
      }
    } catch {}

    return NextResponse.json({
      success: result.success,
      redirectUrl: result.redirectUrl,
      instrument: result.instrument,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
