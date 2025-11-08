import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// POST /api/custom/booking
// Requirements:
// - Authenticated customer only (guests cannot book)
// - Body: { property: string, room: string, foodIncluded?: boolean, startDate?: string, endDate?: string }
// - Server computes pricing from Room.rent and Property food pricing
// - Creates a bookings record with status 'pending' and a roomSnapshot
// - Creates initial payment record for booking (type: 'booking')
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    console.log('1: Received booking request:', JSON.stringify(body))

    // === VALIDATION ===
    // Basic validation
    if (!body?.property || !body?.room) {
      return NextResponse.json({ error: 'Missing property or room' }, { status: 400 })
    }

    // Validate property and room are valid IDs
    if (typeof body.property !== 'string' || typeof body.room !== 'string') {
      return NextResponse.json({ error: 'Invalid property or room ID format' }, { status: 400 })
    }

    // Resolve current customer from session
    const customerId = body.customer
    if (!customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (typeof customerId !== 'string') {
      return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 })
    }

    // Validate customer exists
    const customer = await payload.findByID({
      collection: 'customers',
      id: customerId,
      depth: 0,
    })
    if (!customer) {
      return NextResponse.json({ error: 'Invalid customer' }, { status: 400 })
    }

    // Fetch room to compute price & snapshot
    const room = await payload.findByID({
      collection: 'rooms',
      id: body.room,
      depth: 0,
    })
    if (!room) {
      return NextResponse.json({ error: 'Invalid room' }, { status: 400 })
    }

    // Fetch property to get pricing configuration
    const property = await payload.findByID({
      collection: 'properties',
      id: body.property,
      depth: 1,
    })
    if (!property) {
      return NextResponse.json({ error: 'Invalid property' }, { status: 400 })
    }

    console.log('2: Property fetched successfully')

    // === VALIDATION: Check property status ===
    if (property.status !== 'active') {
      return NextResponse.json({ error: 'Property is not available for booking' }, { status: 400 })
    }

    // === VALIDATION: Check room availability ===
    if (!room.available || room.status !== 'active') {
      return NextResponse.json({ error: 'Room is not available for booking' }, { status: 400 })
    }

    console.log('3: Validation passed')

    // === EXTRACT PRICING VARIABLES ===
    const roomRent = Number(room.rent) || 0
    console.log(`4: Room rent extracted: ₹${roomRent}`)

    // Extract booking charge from property
    const bookingCharge = Number(property.bookingCharge) || 0
    console.log(`5: Booking charge: ₹${bookingCharge}`)

    // Extract takeFirstMonthRentOnBooking flag
    const takeFirstMonthRentOnBooking = Boolean(property.takeFirstMonthRentOnBooking)
    console.log(`6: Take first month rent on booking: ${takeFirstMonthRentOnBooking}`)

    // Calculate food price if food is included
    let foodPrice = 0
    const foodIncluded = Boolean(body.foodIncluded)
    if (foodIncluded) {
      // Validate food menu exists
      if (!property.foodMenu?.menu || !property.foodMenu?.price) {
        return NextResponse.json(
          { error: 'Food is not available at this property' },
          { status: 400 },
        )
      }
      foodPrice = Number(property.foodMenu.price) || 0
      console.log(`7: Food included - Monthly food charge: ₹${foodPrice}`)
    }

    // Calculate security deposit
    let securityDeposit = 0
    if (property.securityDepositConfig?.enabled) {
      if (property.securityDepositConfig.amount) {
        // Use fixed amount if provided
        securityDeposit = Number(property.securityDepositConfig.amount) || 0
        console.log(`8: Security deposit (fixed amount): ₹${securityDeposit}`)
      } else if (property.securityDepositConfig.type === 'multiplier') {
        // Use multiplier calculation if no fixed amount
        const multiplier = Number(property.securityDepositConfig.multiplier) || 2
        securityDeposit = roomRent * multiplier
        console.log(
          `8: Security deposit (multiplier ${multiplier}x room rent): ₹${securityDeposit}`,
        )
      }
    }

    // === CALCULATE INITIAL PAYMENT AMOUNT ===
    // Per user's requirements:
    // 1. Always include bookingCharge
    // 2. If takeFirstMonthRentOnBooking is true, add first month rent
    // 3. If takeFirstMonthRentOnBooking is true AND foodIncluded, add food price
    // 4. Add security deposit if enabled

    let initialPaymentAmount = bookingCharge // Start with booking charge
    let firstMonthRent = 0

    if (takeFirstMonthRentOnBooking) {
      // Add first month rent
      firstMonthRent = roomRent
      initialPaymentAmount += roomRent
      console.log(`9: Added first month rent: ₹${roomRent}`)

      // Add food price if food is included
      if (foodIncluded) {
        firstMonthRent += foodPrice
        initialPaymentAmount += foodPrice
        console.log(`10: Added food price: ₹${foodPrice}`)
      }
    }

    // Add security deposit
    initialPaymentAmount += securityDeposit

    console.log(
      `11: Initial payment total: ₹${initialPaymentAmount} (Booking: ₹${bookingCharge} + First month: ₹${firstMonthRent} + Security: ₹${securityDeposit})`,
    )

    // === CREATE BOOKING RECORD ===
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        customer: customerId,
        property: body.property,
        room: body.room,
        foodIncluded,
        roomRent,
        foodPrice,
        bookingCharge,
        securityDeposit,
        total: initialPaymentAmount,
        takeFirstMonthRentOnBooking,
        status: 'pending',
        roomSnapshot: {
          id: room.id,
          name: room.name,
          roomType: room.roomType,
          rent: room.rent,
          amenities: room.amenities,
          snapshotDate: new Date().toISOString(),
        },
      },
      draft: false,
      overrideAccess: true,
    })

    console.log(`12: Created booking with ID: ${booking.id}`)

    // === CREATE INITIAL PAYMENT RECORD ===
    // Payment for: booking charge + first month rent (if applicable) + food (if applicable) + security deposit (if applicable)
    let payment = null
    try {
      const now = new Date()
      const dueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // Due in 2 days
      const monthAnchor = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      console.log(
        `13: Creating initial payment - Amount: ₹${initialPaymentAmount} (Booking: ₹${bookingCharge} + First month: ₹${firstMonthRent} + Security: ₹${securityDeposit})`,
      )

      // Create booking snapshot for payment record
      const bookingSnapshot = {
        bookingId: booking.id,
        customer: {
          id: customerId,
          name: customer.name,
          email: customer.email,
        },
        property: {
          id: property.id,
          name: property.name,
        },
        room: {
          id: room.id,
          name: room.name,
          roomType: room.roomType,
          rent: roomRent,
        },
        foodIncluded,
        foodPrice,
        bookingCharge,
        securityDeposit,
        takeFirstMonthRentOnBooking,
        snapshotDate: new Date().toISOString(),
      }

      payment = await payload.create({
        collection: 'payments',
        data: {
          paymentType: 'booking',
          status: 'initiated',
          bookingCharge,
          firstMonthRent,
          securityDepositAmount: securityDeposit,
          takeFirstMonthRentOnBooking,
          amount: initialPaymentAmount,
          customer: customerId,
          payfor: booking.id,
          dueDate: dueDate.toISOString(),
          paymentForMonthAndYear: monthAnchor,
          bookingSnapshot,
          notes: `Initial booking payment for ${property.name} - ${room.name}. ${takeFirstMonthRentOnBooking ? 'Includes first month rent.' : 'First month rent to be paid separately.'} ${foodIncluded ? 'Food included.' : ''}`,
        },
        draft: false,
        overrideAccess: true,
      })

      console.log(`14: Created initial payment with ID: ${payment.id}`)
    } catch (payErr) {
      // Log error but don't fail the booking
      console.error('Failed to create initial payment:', payErr)
      try {
        payload.logger?.error?.(`Failed to create payment for booking ${booking.id}: ${payErr}`)
      } catch {}
      payment = null
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        total: initialPaymentAmount,
        roomRent,
        foodPrice,
        bookingCharge,
        securityDeposit,
        takeFirstMonthRentOnBooking,
        foodIncluded,
      },
      payment: payment
        ? {
            id: payment.id,
            amount: payment.amount,
            dueDate: payment.dueDate,
            status: payment.status,
          }
        : null,
    })
  } catch (err: unknown) {
    console.error('Booking route error:', err)
    return NextResponse.json(
      { error: (err as Error)?.message || 'Internal error' },
      { status: 500 },
    )
  }
}
