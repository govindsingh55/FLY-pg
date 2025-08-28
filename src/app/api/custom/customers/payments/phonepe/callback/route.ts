import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyCallbackSignature } from '@/lib/payments/phonepe'

// POST /api/custom/customers/payments/phonepe/callback
// PhonePe callback handler (no authentication required - called by PhonePe)
export async function POST(req: NextRequest) {
  console.log('[Customer PhonePe Callback] Starting callback processing...')

  try {
    const payload = await getPayload({ config })
    const raw = await req.text()
    const xVerify = req.headers.get('x-verify') || req.headers.get('X-VERIFY')

    console.log('[Customer PhonePe Callback] Raw body:', raw)
    console.log('[Customer PhonePe Callback] X-VERIFY header:', xVerify)

    // Verify signature using PhonePe SDK method
    const body = raw ? JSON.parse(raw) : {}
    const valid = verifyCallbackSignature({
      body,
      headerXVerify: xVerify,
    })

    if (!valid) {
      console.error('[Customer PhonePe Callback] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('[Customer PhonePe Callback] Signature verified successfully')

    // Extract transaction identifiers
    const merchantTransactionId = body?.data?.merchantTransactionId || body?.merchantTransactionId
    const code = body?.code || body?.data?.state
    const state = body?.data?.state

    // Improved success detection
    const isSuccess =
      code === 'PAYMENT_SUCCESS' ||
      code === 'SUCCESS' ||
      state === 'PAYMENT_SUCCESS' ||
      state === 'SUCCESS' ||
      body?.success === true

    console.log('[Customer PhonePe Callback] Payment status detection:', {
      merchantTransactionId,
      code,
      state,
      isSuccess,
      bodyKeys: Object.keys(body),
    })

    if (!merchantTransactionId) {
      console.error('[Customer PhonePe Callback] Missing merchantTransactionId')
      return NextResponse.json({ error: 'Missing merchantTransactionId' }, { status: 400 })
    }

    // Find payment by merchant order ID
    const paymentRes: any = await (payload as any).find({
      collection: 'payments',
      where: {
        merchantOrderId: { equals: merchantTransactionId },
      },
      depth: 1,
      limit: 1,
    })

    const payment = paymentRes?.docs?.[0]
    if (!payment) {
      console.error(
        `[Customer PhonePe Callback] Payment not found for merchantTransactionId: ${merchantTransactionId}`,
      )
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update payment status
    try {
      console.log('[Customer PhonePe Callback] Updating payment:', payment.id)

      const updated: any = await (payload as any).update({
        collection: 'payments',
        id: payment.id,
        data: {
          status: isSuccess ? 'completed' : 'failed',
          paymentDate: isSuccess ? new Date().toISOString() : undefined,
          gateway: 'phonepe',
          merchantOrderId: merchantTransactionId,
          phonepeLastCode: code,
          phonepeLastState: state,
          phonepeLastRaw: body,
          updatedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      })

      console.log('[Customer PhonePe Callback] Payment updated successfully:', updated?.id)

      // If completed, confirm booking
      if (isSuccess) {
        const bookingId = typeof updated?.payfor === 'string' ? updated.payfor : updated?.payfor?.id
        if (bookingId) {
          console.log('[Customer PhonePe Callback] Updating booking:', bookingId)
          await (payload as any).update({
            collection: 'bookings',
            id: bookingId,
            data: { status: 'confirmed' },
            overrideAccess: true,
          })
          console.log('[Customer PhonePe Callback] Booking confirmed successfully')
        }
      }
    } catch (updateError: any) {
      console.error(
        '[Customer PhonePe Callback] Error updating payment/booking:',
        updateError?.message,
      )
      // Don't fail the callback - PhonePe might retry
    }

    console.log('[Customer PhonePe Callback] Callback processed successfully')
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Customer PhonePe Callback] Error processing callback:', err?.message)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
