import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCustomerFromSession } from '@/lib/auth/customer-auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const customer = await getCustomerFromSession(req)

    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const body = await req.json()
    const { reason } = body

    // Get the current booking to verify ownership and status
    const currentBooking = await payload.findByID({
      collection: 'bookings',
      id: bookingId,
      depth: 1,
    })

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Ensure the customer can only cancel their own bookings
    if (currentBooking.customer !== customer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if booking can be cancelled
    if (currentBooking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 })
    }

    if (currentBooking.status === 'completed') {
      return NextResponse.json({ error: 'Cannot cancel completed booking' }, { status: 400 })
    }

    // Check cancellation policy (example: can't cancel within 7 days of start date)
    const startDate = new Date(currentBooking.startDate)
    const today = new Date()
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysUntilStart <= 7) {
      return NextResponse.json(
        {
          error: 'Cannot cancel booking within 7 days of start date',
          daysUntilStart,
        },
        { status: 400 },
      )
    }

    // Update the booking status to cancelled
    const updateData: any = {
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by customer',
      cancelledAt: new Date().toISOString(),
      cancelledBy: customer.id,
    }

    const updatedBooking = await payload.update({
      collection: 'bookings',
      id: bookingId,
      data: updateData,
      depth: 2,
    })

    // TODO: Update related payment records if needed
    // This could involve creating refund records or updating payment status

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Booking cancelled successfully',
    })
  } catch (error: unknown) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
