import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'
import { phonePeCheckStatus } from '@/lib/payments/phonepe'

// GET /api/custom/customers/payments/[id]/status
// Check payment status and update local records (customer-authenticated)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!customerRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validate customer session
    const { user, error } = await validateCustomerSession(req)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const { id: paymentId } = await params

    console.log('[Customer Payment Status] Payment ID:', paymentId)

    // Get payment record and verify ownership
    const paymentRes: any = await (payload as any).find({
      collection: 'payments',
      where: {
        and: [{ id: { equals: paymentId } }, { customer: { equals: user.id } }],
      },
      depth: 0,
      limit: 1,
    })

    const payment = paymentRes?.docs?.[0]
    if (!payment) {
      console.error(
        '[Customer Payment Status] Payment not found or not owned by customer:',
        paymentId,
      )
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    console.log('[Customer Payment Status] Payment found:', {
      id: payment.id,
      status: payment.status,
      merchantOrderId: payment.merchantOrderId,
    })

    // If payment is already completed, return current status
    if (payment.status === 'completed') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
        },
      })
    }

    // Check PhonePe status if we have merchant order ID
    if (payment.merchantOrderId && payment.gateway === 'phonepe') {
      try {
        console.log(
          '[Customer Payment Status] Checking PhonePe status for:',
          payment.merchantOrderId,
        )

        const statusResult = await phonePeCheckStatus(payment.merchantOrderId)

        console.log('[Customer Payment Status] PhonePe status result:', statusResult)

        if (statusResult.success && statusResult.raw) {
          const isSuccess =
            statusResult.raw.code === 'PAYMENT_SUCCESS' ||
            statusResult.raw.code === 'SUCCESS' ||
            statusResult.raw.data?.state === 'PAYMENT_SUCCESS' ||
            statusResult.raw.data?.state === 'SUCCESS'

          let newStatus = 'pending'
          let paymentDate = null

          if (isSuccess) {
            newStatus = 'completed'
            paymentDate = new Date().toISOString()
          } else if (
            statusResult.raw.code === 'PAYMENT_ERROR' ||
            statusResult.raw.data?.state === 'PAYMENT_ERROR'
          ) {
            newStatus = 'failed'
          }

          // Update payment status if it changed
          if (newStatus !== payment.status) {
            console.log('[Customer Payment Status] Updating payment status to:', newStatus)

            await (payload as any).update({
              collection: 'payments',
              id: payment.id,
              data: {
                status: newStatus,
                phonepeLastCode: statusResult.raw.code,
                phonepeLastState: statusResult.raw.data?.state,
                phonepeLastRaw: statusResult.raw,
                ...(paymentDate && { paymentDate }),
                updatedAt: new Date().toISOString(),
              },
              overrideAccess: true,
            })

            // If completed, confirm booking
            if (newStatus === 'completed') {
              const bookingId =
                typeof payment.payfor === 'string' ? payment.payfor : payment.payfor?.id
              if (bookingId) {
                console.log('[Customer Payment Status] Confirming booking:', bookingId)
                await (payload as any).update({
                  collection: 'bookings',
                  id: bookingId,
                  data: { status: 'confirmed' },
                  overrideAccess: true,
                })
              }
            }
          }

          return NextResponse.json({
            success: true,
            status: newStatus,
            payment: {
              id: payment.id,
              status: newStatus,
              amount: payment.amount,
              paymentDate: paymentDate || payment.paymentDate,
              merchantOrderId: payment.merchantOrderId,
            },
            phonepe: {
              code: statusResult.raw.code,
              state: statusResult.raw.data?.state,
            },
          })
        }
      } catch (statusError) {
        console.error('[Customer Payment Status] Error checking PhonePe status:', statusError)
        // Continue with current payment status
      }
    }

    // Return current payment status
    return NextResponse.json({
      success: true,
      status: payment.status,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        merchantOrderId: payment.merchantOrderId,
      },
    })
  } catch (err: any) {
    console.error('[Customer Payment Status] Error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
