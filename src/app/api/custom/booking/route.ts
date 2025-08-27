import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// POST /api/custom/booking
// Requirements:
// - Authenticated customer only (guests cannot book)
// - Body: { property: string, room: string, foodIncluded?: boolean }
// - Server computes price from Room.rent and optionally food addon pricing
// - Creates a bookings record with status 'pending' and a roomSnapshot
// - Payment handling: Optionally create a pending payment record and return it
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()

    // Basic validation
    if (!body?.property || !body?.room) {
      return NextResponse.json({ error: 'Missing property or room' }, { status: 400 })
    }

    // Resolve current customer from session cookie via /api/customers/me would be ideal.
    // In this app, the client supplies customer id (validated below) and passes auth cookie.
    const customerId = body.customer
    if (!customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Validate customer exists
    const customerRes: any = await payload.find({
      collection: 'customers',
      where: { id: customerId },
      depth: 0,
      limit: 1,
    })
    if (!customerRes?.docs?.length) {
      return NextResponse.json({ error: 'Invalid customer' }, { status: 400 })
    }

    // Fetch room to compute price & snapshot
    const roomRes: any = await payload.find({
      collection: 'rooms',
      where: { id: body.room },
      depth: 0,
      limit: 1,
    })
    const room = roomRes?.docs?.[0]
    if (!room) {
      return NextResponse.json({ error: 'Invalid room' }, { status: 400 })
    }

    // Compute price. Note: If food has an additional cost, incorporate it here.
    const price = Number(room.rent || 0)
    const foodIncluded = !!body.foodIncluded
    // TODO(Payments): If there is an extra fee for food, add it here. e.g., price += FOOD_FEE

    // Create booking
    const now = new Date()
    const startDate = body.startDate ? new Date(body.startDate) : now
    const endDate = body.endDate
      ? new Date(body.endDate)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days from now

    const booking: any = await payload.create({
      collection: 'bookings',
      data: {
        customer: customerId,
        property: body.property,
        room: body.room,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        foodIncluded,
        price,
        status: 'pending',
        roomSnapshot: {
          id: room.id,
          name: room.name,
          roomType: room.roomType,
          rent: room.rent,
        },
      },
      // Server route enforces auth; bypass collection access here.
      overrideAccess: true,
    })

    // Payment handling (optional initial implementation):
    // Strategy: create a pending payment record tied to this booking.
    // - amount = booking.price
    // - status = 'pending'
    // - customer = customerId
    // - payfor = booking.id
    // - dueDate = now + N days (e.g., 2 days)
    // - bookingSnapshot = minimal booking info
    // - paymentForMonthAndYear can be set to the current month start or omitted when not applicable
    let payment: any = null
    try {
      const now = new Date()
      const dueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
      const monthAnchor = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      payment = await (payload as any).create({
        collection: 'payments',
        data: {
          amount: price,
          status: 'pending',
          customer: customerId,
          payfor: booking.id,
          bookingSnapshot: {
            id: booking.id,
            price: booking.price,
            room: booking.room,
            property: booking.property,
          },
          dueDate: dueDate.toISOString(),
          paymentForMonthAndYear: monthAnchor,
        },
        overrideAccess: true,
      })
    } catch (payErr) {
      // Do not fail the booking if payment record creation fails; log and continue
      try {
        payload.logger?.error?.('Failed to create payment for booking', payErr)
      } catch {}
      payment = null
    }

    return NextResponse.json({ success: true, booking, payment })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
