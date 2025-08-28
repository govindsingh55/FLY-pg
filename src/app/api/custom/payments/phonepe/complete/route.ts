import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { phonePeCheckStatus } from '@/lib/payments/phonepe'

// POST /api/custom/payments/phonepe/complete
// Complete a payment by checking its status with PhonePe and updating local records
export async function POST(req: NextRequest) {
  console.log('[PhonePe Complete] Starting payment completion process...')

  try {
    const payload = await getPayload({ config })
    const body = await req.json()

    const { paymentId, merchantTransactionId } = body

    if (!paymentId && !merchantTransactionId) {
      console.error('[PhonePe Complete] Missing paymentId or merchantTransactionId')
      return NextResponse.json(
        { error: 'Missing paymentId or merchantTransactionId' },
        { status: 400 },
      )
    }

    let payment: any = null

    // Find payment by ID or merchant transaction ID
    if (paymentId) {
      try {
        payment = await payload.findByID({
          collection: 'payments',
          id: paymentId,
        })
      } catch (e) {
        console.error('[PhonePe Complete] Payment not found by ID:', paymentId)
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }
    } else if (merchantTransactionId) {
      const paymentRes: any = await payload.find({
        collection: 'payments',
        where: {
          phonepeMerchantTransactionId: { equals: merchantTransactionId },
        },
        limit: 1,
      })
      payment = paymentRes?.docs?.[0]
      if (!payment) {
        console.error(
          '[PhonePe Complete] Payment not found by merchant transaction ID:',
          merchantTransactionId,
        )
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }
    }

    console.log('[PhonePe Complete] Payment found:', {
      id: payment.id,
      status: payment.status,
      merchantTransactionId: payment.phonepeMerchantTransactionId || payment.merchantOrderId,
    })

    // Get the merchant transaction ID for PhonePe status check
    const txId = payment.phonepeMerchantTransactionId || payment.merchantOrderId
    if (!txId) {
      console.error('[PhonePe Complete] No merchant transaction ID found')
      return NextResponse.json({ error: 'Payment not initiated with PhonePe' }, { status: 400 })
    }

    // Check status with PhonePe
    const statusResult = await phonePeCheckStatus(txId)
    console.log('[PhonePe Complete] PhonePe status result:', statusResult)

    // Determine if payment is successful
    const isSuccess =
      statusResult.state === 'COMPLETED' ||
      statusResult.state === 'SUCCESS' ||
      statusResult.code === 'PAYMENT_SUCCESS' ||
      statusResult.code === 'SUCCESS'

    const isFailed =
      statusResult.state === 'FAILED' ||
      statusResult.state === 'PAYMENT_ERROR' ||
      statusResult.code === 'PAYMENT_ERROR'

    console.log('[PhonePe Complete] Payment status determination:', {
      currentStatus: payment.status,
      state: statusResult.state,
      code: statusResult.code,
      isSuccess,
      isFailed,
    })

    // Update payment status if it changed
    let updatedPayment = payment
    let updatedBooking = null

    if ((payment.status === 'pending' || payment.status === 'initiated') && isSuccess) {
      console.log('[PhonePe Complete] Updating payment to completed')
      updatedPayment = await payload.update({
        collection: 'payments',
        id: payment.id,
        data: {
          status: 'completed',
          paymentDate: new Date().toISOString(),
          phonepeLastCode: statusResult.code,
          phonepeLastState: statusResult.state,
          phonepeLastRaw: statusResult.raw,
        },
        overrideAccess: true,
      })

      // Update booking status to confirmed
      const bookingId = typeof payment.payfor === 'string' ? payment.payfor : payment.payfor?.id
      if (bookingId) {
        console.log('[PhonePe Complete] Updating booking to confirmed:', bookingId)
        updatedBooking = await payload.update({
          collection: 'bookings',
          id: bookingId,
          data: { status: 'confirmed' },
          overrideAccess: true,
        })
      }
    } else if ((payment.status === 'pending' || payment.status === 'initiated') && isFailed) {
      console.log('[PhonePe Complete] Updating payment to failed')
      updatedPayment = await payload.update({
        collection: 'payments',
        id: payment.id,
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
        console.log('[PhonePe Complete] Updating booking to cancelled:', bookingId)
        updatedBooking = await payload.update({
          collection: 'bookings',
          id: bookingId,
          data: { status: 'cancelled' },
          overrideAccess: true,
        })
      }
    }

    console.log('[PhonePe Complete] Payment completion process finished successfully')

    return NextResponse.json({
      success: true,
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        merchantOrderId:
          updatedPayment.phonepeMerchantTransactionId || updatedPayment.merchantOrderId,
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
        isFailed,
        raw: statusResult.raw,
      },
    })
  } catch (err: any) {
    console.error('[PhonePe Complete] Error completing payment:', err?.message)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
