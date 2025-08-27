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
    const { rating, review } = body

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (!review || review.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review must be at least 10 characters long' },
        { status: 400 },
      )
    }

    // Get the current booking to verify ownership and status
    const currentBooking = await payload.findByID({
      collection: 'bookings',
      id: bookingId,
      depth: 1,
    })

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Ensure the customer can only review their own bookings
    if (currentBooking.customer !== customer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if booking can be reviewed
    if (currentBooking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot review cancelled booking' }, { status: 400 })
    }

    if (currentBooking.status === 'pending') {
      return NextResponse.json({ error: 'Cannot review pending booking' }, { status: 400 })
    }

    // Check if booking has already been reviewed
    if (currentBooking.rating || currentBooking.review) {
      return NextResponse.json({ error: 'Booking has already been reviewed' }, { status: 400 })
    }

    // Update the booking with the review
    const updateData = {
      rating: parseInt(rating),
      review: review.trim(),
      reviewedAt: new Date().toISOString(),
    }

    const updatedBooking = await payload.update({
      collection: 'bookings',
      id: bookingId,
      data: updateData,
      depth: 2,
    })

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Review submitted successfully',
    })
  } catch (error: unknown) {
    console.error('Error submitting review:', error)
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
    const { rating, review } = body

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (!review || review.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review must be at least 10 characters long' },
        { status: 400 },
      )
    }

    // Get the current booking to verify ownership
    const currentBooking = await payload.findByID({
      collection: 'bookings',
      id: bookingId,
      depth: 1,
    })

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Ensure the customer can only update their own reviews
    if (currentBooking.customer !== customer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if booking has been reviewed
    if (!currentBooking.rating || !currentBooking.review) {
      return NextResponse.json({ error: 'Booking has not been reviewed yet' }, { status: 400 })
    }

    // Update the booking review
    const updateData = {
      rating: parseInt(rating),
      review: review.trim(),
      reviewedAt: new Date().toISOString(),
    }

    const updatedBooking = await payload.update({
      collection: 'bookings',
      id: bookingId,
      data: updateData,
      depth: 2,
    })

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Review updated successfully',
    })
  } catch (error: unknown) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
