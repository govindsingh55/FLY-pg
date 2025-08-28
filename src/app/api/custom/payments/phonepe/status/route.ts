import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { phonePeCheckStatus } from '@/lib/payments/phonepe'

// GET /api/custom/payments/phonepe/status?paymentId=...
// Check payment status and update local records
export async function GET(req: NextRequest) {
  console.log('[PhonePe Status] Starting status check...')

  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(req.url)
    const paymentId = searchParams.get('paymentId')

    console.log('[PhonePe Status] Payment ID:', paymentId)

    if (!paymentId) {
      console.error('[PhonePe Status] Missing paymentId parameter')
      return NextResponse.json({ error: 'Missing paymentId parameter' }, { status: 400 })
    }

    // Get payment record
    let payment: any = null
    try {
      payment = await payload.findByID({
        collection: 'payments',
        id: paymentId,
      })
    } catch (e) {
      console.error('[PhonePe Status] Payment not found:', paymentId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    console.log('[PhonePe Status] Payment found:', {
      id: payment.id,
      status: payment.status,
      merchantTransactionId: payment.merchantOrderId,
    })

    if (!payment.merchantOrderId) {
      console.error('[PhonePe Status] No merchant transaction ID found')
      return NextResponse.json({ error: 'Payment not initiated with PhonePe' }, { status: 400 })
    }

    // Check status with PhonePe
    const statusResult = await phonePeCheckStatus(payment.merchantOrderId)
    console.log('[PhonePe Status] PhonePe status result:', statusResult)

    // Determine if payment is successful
    const isSuccess =
      statusResult.state === 'COMPLETED' ||
      statusResult.state === 'SUCCESS' ||
      statusResult.code === 'PAYMENT_SUCCESS' ||
      statusResult.code === 'SUCCESS'

    // Handle empty response case
    const isPending = statusResult.code === 'EMPTY_RESPONSE' || !statusResult.state

    console.log('[PhonePe Status] Payment success determination:', {
      currentStatus: payment.status,
      state: statusResult.state,
      code: statusResult.code,
      isSuccess,
      isPending,
    })

    // Update payment status if it changed
    let updatedPayment = payment
    let updatedBooking = null

    if ((payment.status === 'pending' || payment.status === 'initiated') && isSuccess) {
      console.log('[PhonePe Status] Updating payment to completed')
      updatedPayment = await payload.update({
        collection: 'payments',
        id: paymentId,
        data: {
          status: 'completed',
          paymentDate: new Date().toISOString(),
          phonepeLastCode: statusResult.code,
          phonepeLastState: statusResult.state,
          phonepeLastRaw: statusResult.raw,
        },
        overrideAccess: true,
      })

      // Update booking status
      const bookingId = typeof payment.payfor === 'string' ? payment.payfor : payment.payfor?.id
      if (bookingId) {
        console.log('[PhonePe Status] Updating booking to confirmed:', bookingId)
        updatedBooking = await payload.update({
          collection: 'bookings',
          id: bookingId,
          data: { status: 'confirmed' },
          overrideAccess: true,
        })
      }
    } else if (
      (payment.status === 'pending' || payment.status === 'initiated') &&
      !isSuccess &&
      (statusResult.state === 'FAILED' || statusResult.state === 'PAYMENT_ERROR')
    ) {
      console.log('[PhonePe Status] Updating payment to failed')
      updatedPayment = await payload.update({
        collection: 'payments',
        id: paymentId,
        data: {
          status: 'failed',
          phonepeLastCode: statusResult.code,
          phonepeLastState: statusResult.state,
          phonepeLastRaw: statusResult.raw,
        },
        overrideAccess: true,
      })

      // Update booking status to cancelled
      const bookingId = typeof payment.payfor === 'string' ? payment.payfor : payment.payfor?.id
      if (bookingId) {
        console.log('[PhonePe Status] Updating booking to cancelled:', bookingId)
        updatedBooking = await payload.update({
          collection: 'bookings',
          id: bookingId,
          data: { status: 'cancelled' },
          overrideAccess: true,
        })
      }
    }

    console.log('[PhonePe Status] Status check completed successfully')

    return NextResponse.json({
      success: true,
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        merchantOrderId: updatedPayment.merchantOrderId,
        phonepeLastState: updatedPayment.phonepeLastState,
        phonepeLastCode: updatedPayment.phonepeLastCode,
      },
      booking: updatedBooking
        ? {
            id: updatedBooking.id,
            status: updatedBooking.status,
          }
        : null,
      phonepeStatus: {
        state: statusResult.state,
        code: statusResult.code,
        isSuccess,
        isPending,
        raw: statusResult.raw,
      },
    })
  } catch (err: any) {
    console.error('[PhonePe Status] Error checking status:', err?.message)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
