import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCustomerFromSession } from '@/lib/auth/customer-auth'
import { phonePeCreatePayment } from '@/lib/payments/phonepe'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const customer = await getCustomerFromSession(req)

    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { amount, bookingId, paymentMethod, paymentForMonthAndYear, description } = body

    // Validate required fields
    if (!amount || !bookingId || !paymentForMonthAndYear) {
      return NextResponse.json(
        { error: 'Amount, booking ID, and payment month are required' },
        { status: 400 },
      )
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Get the booking to verify ownership and calculate due date
    const booking = await payload.findByID({
      collection: 'bookings',
      id: bookingId,
      depth: 1,
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Ensure the customer can only pay for their own bookings
    if (booking.customer !== customer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if booking is active
    if (!booking.status || !['confirmed', 'extended'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Cannot make payment for inactive booking' },
        { status: 400 },
      )
    }

    // Calculate due date (5th of the payment month)
    const paymentDate = new Date(paymentForMonthAndYear)
    const dueDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 5)

    // Check if payment already exists for this month and booking
    const existingPayment = await payload.find({
      collection: 'payments',
      where: {
        and: [
          {
            customer: {
              equals: customer.id,
            },
          },
          {
            payfor: {
              equals: bookingId,
            },
          },
          {
            paymentForMonthAndYear: {
              equals: paymentForMonthAndYear,
            },
          },
        ],
      },
      limit: 1,
    })

    if (existingPayment.docs.length > 0) {
      return NextResponse.json({ error: 'Payment already exists for this month' }, { status: 400 })
    }

    // Create payment record
    const paymentData = {
      amount,
      customer: customer.id,
      payfor: bookingId,
      paymentForMonthAndYear,
      dueDate: dueDate.toISOString(),
      status: 'pending' as const,
      paymentMethod: paymentMethod || 'upi',
      bookingSnapshot: {
        id: booking.id,
        property: booking.property,
        room: booking.room,
        startDate: booking.startDate,
        endDate: booking.endDate,
        price: booking.price,
      },
      notes:
        description ||
        `Rent payment for ${new Date(paymentForMonthAndYear).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    }

    const payment = await payload.create({
      collection: 'payments',
      data: paymentData,
    })

    // Generate unique transaction ID
    const merchantOrderId = `FLY_${payment.id}_${Date.now()}`

    // Prepare PhonePe payment request
    const phonePeRequest = {
      merchantOrderId,
      amountPaise: amount * 100, // Convert to paise
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/rent/payments/${payment.id}`,
    }

    // Initiate PhonePe payment
    const phonePeResponse = await phonePeCreatePayment(phonePeRequest)

    if (!phonePeResponse.success) {
      // Update payment status to failed
      await payload.update({
        collection: 'payments',
        id: payment.id,
        data: {
          status: 'failed',
          phonepeLastRaw: phonePeResponse,
        },
      })

      return NextResponse.json(
        { error: 'Payment initiation failed', details: phonePeResponse },
        { status: 400 },
      )
    }

    // Update payment with PhonePe details
    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        merchantOrderId,
        phonepeLastRaw: phonePeResponse,
        phonepeLastCode: phonePeResponse.raw?.code,
        phonepeLastState: phonePeResponse.raw?.data?.state,
      },
    })

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount,
        status: 'pending',
        merchantOrderId,
      },
      phonePe: {
        redirectUrl: phonePeResponse.raw?.data?.instrumentResponse?.redirectInfo?.url,
        transactionId: phonePeResponse.raw?.data?.transactionId,
      },
      message: 'Payment initiated successfully',
    })
  } catch (error: unknown) {
    console.error('Error initiating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
