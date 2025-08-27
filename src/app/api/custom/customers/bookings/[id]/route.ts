import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCustomerFromSession } from '@/lib/auth/customer-auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const customer = await getCustomerFromSession(req)

    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params

    // Get the booking with populated relationships
    const booking = await payload.findByID({
      collection: 'bookings',
      id: bookingId,
      depth: 2, // Populate relationships
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Ensure the customer can only access their own bookings
    if (booking.customer !== customer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (error: unknown) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const customer = await getCustomerFromSession(req)

    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const body = await req.json()

    // Get the current booking to verify ownership
    const currentBooking = await payload.findByID({
      collection: 'bookings',
      id: bookingId,
    })

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Ensure the customer can only update their own bookings
    if (currentBooking.customer !== customer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only allow updating specific fields that customers should be able to modify
    const allowedFields = ['specialRequests', 'notes', 'rating', 'review']

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // If rating/review is being updated, set the reviewedAt timestamp
    if (updateData.rating || updateData.review) {
      updateData.reviewedAt = new Date().toISOString()
    }

    // Update the booking
    const updatedBooking = await payload.update({
      collection: 'bookings',
      id: bookingId,
      data: updateData,
      depth: 2, // Populate relationships
    })

    return NextResponse.json({ booking: updatedBooking })
  } catch (error: unknown) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
