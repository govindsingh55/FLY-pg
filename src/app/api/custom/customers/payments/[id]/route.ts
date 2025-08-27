import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

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

    // Get payment details
    const payment = await payload.findByID({
      collection: 'payments',
      id: paymentId,
      depth: 2,
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Verify the payment belongs to the authenticated customer
    const customerId =
      typeof payment.customer === 'string' ? payment.customer : payment.customer?.id
    if (customerId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if user wants to download receipt
    const { searchParams } = new URL(req.url)
    const downloadReceipt = searchParams.get('download') === 'true'

    if (downloadReceipt && payment.paymentReceipt) {
      // Get the receipt file
      const receipt = await payload.findByID({
        collection: 'media',
        id:
          typeof payment.paymentReceipt === 'string'
            ? payment.paymentReceipt
            : payment.paymentReceipt.id,
      })

      if (receipt && receipt.url) {
        // Redirect to the receipt URL for download
        return NextResponse.redirect(receipt.url)
      } else {
        return NextResponse.json({ error: 'Receipt not available' }, { status: 404 })
      }
    }

    // Return payment details
    return NextResponse.json({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      dueDate: payment.dueDate,
      paymentForMonthAndYear: payment.paymentForMonthAndYear,
      lateFees: payment.lateFees || 0,
      utilityCharges: payment.utilityCharges || 0,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      paymentMethodDetails: payment.paymentMethodDetails,
      paymentReceipt:
        payment.paymentReceipt && typeof payment.paymentReceipt === 'object'
          ? {
              id: payment.paymentReceipt.id,
              filename: payment.paymentReceipt.filename,
              url: payment.paymentReceipt.url,
            }
          : null,
      booking:
        payment.payfor && typeof payment.payfor === 'object'
          ? {
              id: payment.payfor.id,
              startDate: payment.payfor.startDate,
              endDate: payment.payfor.endDate,
              property:
                payment.payfor.property && typeof payment.payfor.property === 'object'
                  ? {
                      name: payment.payfor.property.name,
                      location: payment.payfor.property.address?.location,
                    }
                  : null,
              room:
                payment.payfor.room && typeof payment.payfor.room === 'object'
                  ? {
                      name: payment.payfor.room.name,
                      type: payment.payfor.room.roomType,
                    }
                  : null,
            }
          : null,
      // PhonePe specific fields
      phonepeMerchantTransactionId: payment.phonepeMerchantTransactionId,
      phonepeTransactionId: payment.phonepeTransactionId,
      gateway: payment.gateway,
      // Analytics fields
      processingTime: payment.processingTime,
      retryCount: payment.retryCount,
      customerSatisfactionScore: payment.customerSatisfactionScore,
      paymentSource: payment.paymentSource,
      deviceInfo: payment.deviceInfo,
    })
  } catch (error: any) {
    console.error('Error fetching payment details:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get payment details
    const payment = await payload.findByID({
      collection: 'payments',
      id: paymentId,
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Verify the payment belongs to the authenticated customer
    const customerId =
      typeof payment.customer === 'string' ? payment.customer : payment.customer?.id
    if (customerId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only allow updates to certain fields
    const body = await req.json()
    const allowedUpdates: any = {}

    // Allow customer to update satisfaction score
    if (body.customerSatisfactionScore !== undefined) {
      if (body.customerSatisfactionScore >= 1 && body.customerSatisfactionScore <= 5) {
        allowedUpdates.customerSatisfactionScore = body.customerSatisfactionScore
      } else {
        return NextResponse.json(
          { error: 'Satisfaction score must be between 1 and 5' },
          { status: 400 },
        )
      }
    }

    // Allow customer to add notes
    if (body.notes !== undefined) {
      allowedUpdates.notes = body.notes
    }

    // Update payment
    const updatedPayment = await payload.update({
      collection: 'payments',
      id: paymentId,
      data: allowedUpdates,
    })

    return NextResponse.json({
      message: 'Payment updated successfully',
      payment: {
        id: updatedPayment.id,
        customerSatisfactionScore: updatedPayment.customerSatisfactionScore,
        notes: updatedPayment.notes,
        updatedAt: updatedPayment.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
