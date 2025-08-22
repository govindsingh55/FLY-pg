import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyCallbackSignatureRaw } from '@/lib/payments/phonepe'

// POST /api/custom/payments/phonepe/callback
// PhonePe will hit this endpoint after user completes/cancels the payment (server-side callback/webhook).
// Verify signature and update payment & booking accordingly.
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const raw = await req.text()
    const xVerify = req.headers.get('x-verify') || req.headers.get('X-VERIFY')
    const endpointPath =
      process.env.PHONEPE_CALLBACK_VERIFY_PATH || '/api/custom/payments/phonepe/callback'

    const valid = verifyCallbackSignatureRaw({
      rawJsonText: raw || '{}',
      headerXVerify: xVerify,
      endpointPath,
    })
    if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

    const body = (raw ? JSON.parse(raw) : {}) as any
    // Extract transaction identifiers (shape per PhonePe docs)
    const merchantTransactionId = body?.data?.merchantTransactionId || body?.merchantTransactionId
    const code = body?.code || body?.data?.state
    const isSuccess = code === 'PAYMENT_SUCCESS' || code === 'SUCCESS' || body?.success === true

    if (!merchantTransactionId)
      return NextResponse.json({ error: 'Missing merchantTransactionId' }, { status: 400 })
    const paymentId = merchantTransactionId.replace(/^BOOK-/, '')

    // Update local payment and booking
    try {
      const updated: any = await (payload as any).update({
        collection: 'payments',
        id: paymentId,
        data: {
          status: isSuccess ? 'completed' : 'failed',
          paymentDate: isSuccess ? new Date().toISOString() : undefined,
          gateway: 'phonepe',
          phonepeMerchantTransactionId: merchantTransactionId,
          phonepeTransactionId: body?.data?.transactionId || body?.transactionId,
          phonepeLastCode: body?.code || body?.data?.code,
          phonepeLastState: body?.data?.state,
          phonepeLastRaw: body,
        },
        overrideAccess: true,
      })

      // If completed, confirm booking
      if (isSuccess) {
        const bookingId = typeof updated?.payfor === 'string' ? updated.payfor : updated?.payfor?.id
        if (bookingId) {
          await (payload as any).update({
            collection: 'bookings',
            id: bookingId,
            data: { status: 'confirmed' },
            overrideAccess: true,
          })
        }
      }
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
