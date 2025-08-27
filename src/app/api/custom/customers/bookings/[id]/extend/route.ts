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
    const { requestedEndDate, reason } = body

    if (!requestedEndDate || !reason) {
      return NextResponse.json(
        { error: 'Requested end date and reason are required' },
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

    // Ensure the customer can only extend their own bookings
    if (currentBooking.customer !== customer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if booking can be extended
    if (currentBooking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot extend cancelled booking' }, { status: 400 })
    }

    if (currentBooking.status === 'completed') {
      return NextResponse.json({ error: 'Cannot extend completed booking' }, { status: 400 })
    }

    // Validate requested end date
    const newEndDate = new Date(requestedEndDate)
    const currentEndDate = new Date(currentBooking.endDate)

    if (newEndDate <= currentEndDate) {
      return NextResponse.json(
        { error: 'Requested end date must be after current end date' },
        { status: 400 },
      )
    }

    // Check if there's already a pending extension request
    const existingRequests = currentBooking.extensionRequests || []
    const pendingRequest = existingRequests.find((req: any) => req.status === 'pending')

    if (pendingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending extension request' },
        { status: 400 },
      )
    }

    // Create new extension request
    const newExtensionRequest = {
      requestedEndDate: newEndDate.toISOString(),
      reason,
      status: 'pending' as const,
      requestedAt: new Date().toISOString(),
    }

    // Add the new request to the existing array
    const updatedExtensionRequests = [...existingRequests, newExtensionRequest]

    // Update the booking with the new extension request
    const updatedBooking = await payload.update({
      collection: 'bookings',
      id: bookingId,
      data: {
        extensionRequests: updatedExtensionRequests,
      },
      depth: 2,
    })

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Extension request submitted successfully',
    })
  } catch (error: unknown) {
    console.error('Error requesting booking extension:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
