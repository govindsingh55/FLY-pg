import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  verifyCallbackSignature,
  isPhonePePaymentSuccess,
  isPhonePePaymentFailed,
} from '@/lib/payments/phonepe'

// POST /api/custom/customers/payments/phonepe/callback
// PhonePe callback handler (no customer authentication - called by PhonePe servers)
// Security: Verified via X-VERIFY signature header
export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString()
  console.log(`[Customer PhonePe Callback ${timestamp}] Starting callback processing...`)

  try {
    const payload = await getPayload({ config })
    const raw = await req.text()
    const xVerify = req.headers.get('x-verify') || req.headers.get('X-VERIFY')

    console.log(`[Customer PhonePe Callback ${timestamp}] Raw body:`, raw)
    console.log(`[Customer PhonePe Callback ${timestamp}] X-VERIFY header:`, xVerify)

    // Verify signature using PhonePe SDK method (security check)
    const body = raw ? JSON.parse(raw) : {}
    const valid = verifyCallbackSignature({
      body,
      headerXVerify: xVerify,
    })

    if (!valid) {
      console.error(`[Customer PhonePe Callback ${timestamp}] Invalid signature - rejecting`)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log(`[Customer PhonePe Callback ${timestamp}] Signature verified successfully`)

    // Extract transaction identifiers
    const merchantTransactionId = body?.data?.merchantTransactionId || body?.merchantTransactionId
    const code = body?.code || body?.data?.code
    const state = body?.data?.state || body?.state
    const responseState = body?.data?.responseState || state

    // Use standardized success detection helper
    const isSuccess = isPhonePePaymentSuccess(body)
    const isFailed = isPhonePePaymentFailed(body)

    console.log(`[Customer PhonePe Callback ${timestamp}] Payment status detection:`, {
      merchantTransactionId,
      code,
      state,
      responseState,
      isSuccess,
      isFailed,
      bodyKeys: Object.keys(body),
    })

    if (!merchantTransactionId) {
      console.error(`[Customer PhonePe Callback ${timestamp}] Missing merchantTransactionId`)
      return NextResponse.json({ error: 'Missing merchantTransactionId' }, { status: 400 })
    }

    // Find payment by merchant order ID
    const paymentRes = await payload.find({
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
        `[Customer PhonePe Callback ${timestamp}] Payment not found for merchantTransactionId: ${merchantTransactionId}`,
      )
      // Return 200 to PhonePe to prevent retries for non-existent payments
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 200 })
    }

    console.log(`[Customer PhonePe Callback ${timestamp}] Payment found:`, {
      id: payment.id,
      currentStatus: payment.status,
      merchantOrderId: payment.merchantOrderId,
    })

    // Idempotency check: if already completed, don't re-process
    if (payment.status === 'completed') {
      console.log(
        `[Customer PhonePe Callback ${timestamp}] Payment already completed - returning success (idempotent)`,
      )
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // Update payment status
    try {
      console.log(`[Customer PhonePe Callback ${timestamp}] Updating payment:`, payment.id)

      // Determine new status based on callback data
      let newStatus: 'completed' | 'failed' | 'processing' = 'processing'
      if (isSuccess) {
        newStatus = 'completed'
      } else if (isFailed) {
        newStatus = 'failed'
      }

      console.log(
        `[Customer PhonePe Callback ${timestamp}] Status transition: ${payment.status} -> ${newStatus}`,
      )

      // Status transition validation: prevent invalid transitions from completed status
      const currentStatus = payment.status as string
      if (currentStatus === 'completed' && newStatus !== 'completed') {
        console.warn(
          `[Customer PhonePe Callback ${timestamp}] Attempted invalid transition from completed to ${newStatus} - ignoring`,
        )
        return NextResponse.json({ success: true, message: 'Invalid status transition' })
      }

      const updated = await payload.update({
        collection: 'payments',
        id: payment.id,
        data: {
          status: newStatus,
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

      console.log(
        `[Customer PhonePe Callback ${timestamp}] Payment updated successfully:`,
        updated?.id,
      )

      // If completed, confirm booking
      if (isSuccess && newStatus === 'completed') {
        const bookingId = typeof updated?.payfor === 'string' ? updated.payfor : updated?.payfor?.id

        if (!bookingId) {
          console.warn(
            `[Customer PhonePe Callback ${timestamp}] No booking ID found in payment.payfor - skipping booking confirmation`,
          )
        } else {
          try {
            console.log(`[Customer PhonePe Callback ${timestamp}] Updating booking:`, bookingId)

            // Check if booking exists before updating
            const bookingCheck = await payload.find({
              collection: 'bookings',
              where: { id: { equals: bookingId } },
              limit: 1,
            })

            const existingBooking = bookingCheck?.docs?.[0]
            if (!existingBooking) {
              console.error(
                `[Customer PhonePe Callback ${timestamp}] Booking not found: ${bookingId}`,
              )
            } else if (existingBooking.status === 'confirmed') {
              console.log(
                `[Customer PhonePe Callback ${timestamp}] Booking already confirmed - skipping update`,
              )
            } else {
              await payload.update({
                collection: 'bookings',
                id: bookingId,
                data: { status: 'confirmed' },
                overrideAccess: true,
              })
              console.log(
                `[Customer PhonePe Callback ${timestamp}] Booking confirmed successfully:`,
                bookingId,
              )
            }
          } catch (bookingError) {
            console.error(
              `[Customer PhonePe Callback ${timestamp}] Error updating booking:`,
              bookingError instanceof Error ? bookingError.message : String(bookingError),
            )
            // Don't fail the callback - payment is still completed
          }
        }
      }
    } catch (updateError) {
      console.error(
        `[Customer PhonePe Callback ${timestamp}] Error updating payment/booking:`,
        updateError instanceof Error ? updateError.message : String(updateError),
      )
      // Return 200 to PhonePe even on error to prevent retries
      // The status API will handle verification later
      return NextResponse.json(
        { success: false, error: 'Update failed but acknowledged' },
        { status: 200 },
      )
    }

    console.log(`[Customer PhonePe Callback ${timestamp}] Callback processed successfully`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(
      `[Customer PhonePe Callback ${timestamp}] Error processing callback:`,
      err instanceof Error ? err.message : String(err),
    )
    // Return 200 to prevent PhonePe retries on parsing errors
    return NextResponse.json({ error: 'Internal error' }, { status: 200 })
  }
}
