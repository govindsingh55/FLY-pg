import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyCallbackSignature } from '@/lib/payments/phonepe'

// POST /api/custom/payments/phonepe/callback
// PhonePe will hit this endpoint after user completes/cancels the payment (server-side callback/webhook).
// Verify signature and update payment & booking accordingly.
export async function POST(req: NextRequest) {
  console.log('[PhonePe Callback] Starting callback processing...')

  try {
    const payload = await getPayload({ config })
    const raw = await req.text()
    const xVerify = req.headers.get('x-verify') || req.headers.get('X-VERIFY')

    console.log('[PhonePe Callback] Raw body:', raw)
    console.log('[PhonePe Callback] X-VERIFY header:', xVerify)

    // Verify signature using new SDK method
    const body = raw ? JSON.parse(raw) : {}
    const valid = verifyCallbackSignature({
      body,
      headerXVerify: xVerify,
    })

    if (!valid) {
      console.error('[PhonePe Callback] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('[PhonePe Callback] Signature verified successfully')

    // Extract transaction identifiers (shape per PhonePe docs)
    const merchantTransactionId = body?.data?.merchantTransactionId || body?.merchantTransactionId
    const code = body?.code || body?.data?.state
    const state = body?.data?.state

    // Improved success detection - PhonePe uses different response structures
    const isSuccess =
      code === 'PAYMENT_SUCCESS' ||
      code === 'SUCCESS' ||
      state === 'PAYMENT_SUCCESS' ||
      state === 'SUCCESS' ||
      body?.success === true

    console.log('[PhonePe Callback] Payment status detection:', {
      merchantTransactionId,
      code,
      state,
      isSuccess,
      bodyKeys: Object.keys(body),
    })

    if (!merchantTransactionId) {
      console.error('[PhonePe Callback] Missing merchantTransactionId')
      return NextResponse.json({ error: 'Missing merchantTransactionId' }, { status: 400 })
    }

    const paymentId = merchantTransactionId.replace(/^BOOK-/, '')

    // Update local payment and booking
    try {
      console.log('[PhonePe Callback] Updating payment:', paymentId)

      const updated: any = await payload.update({
        collection: 'payments',
        id: paymentId,
        data: {
          status: isSuccess ? 'completed' : 'failed',
          paymentDate: isSuccess ? new Date().toISOString() : undefined,
          gateway: 'phonepe',
          merchantOrderId: merchantTransactionId,
          phonepeLastCode: code,
          phonepeLastState: state,
          phonepeLastRaw: body,
        },
        overrideAccess: true,
      })

      console.log('[PhonePe Callback] Payment updated successfully:', updated?.id)

      // If completed, confirm booking
      if (isSuccess) {
        const bookingId = typeof updated?.payfor === 'string' ? updated.payfor : updated?.payfor?.id
        if (bookingId) {
          console.log('[PhonePe Callback] Updating booking:', bookingId)
          await payload.update({
            collection: 'bookings',
            id: bookingId,
            data: { status: 'confirmed' },
            overrideAccess: true,
          })
          console.log('[PhonePe Callback] Booking confirmed successfully')
        }
      }
    } catch (updateError: any) {
      console.error('[PhonePe Callback] Error updating payment/booking:', updateError?.message)
      // Don't fail the callback - PhonePe might retry
    }

    console.log('[PhonePe Callback] Callback processed successfully')
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[PhonePe Callback] Error processing callback:', err?.message)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
