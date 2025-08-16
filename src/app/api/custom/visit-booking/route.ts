import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Validate required fields
    if (!body.property || !body.visitDate) {
      return NextResponse.json({ error: 'Missing property or visitDate' }, { status: 400 })
    }
    // If guestUser, validate guest fields
    if (!body.customer && body.guestUser) {
      const { guestName, email, phone } = body.guestUser
      if (!guestName || !email || !phone) {
        return NextResponse.json({ error: 'Missing guest details' }, { status: 400 })
      }
    }

    if (body.customer && !body.guestUser) {
      const customerData = await payload.find({
        collection: 'customers',
        where: {
          id: body.customer,
        },
      })
      if (!customerData) {
        return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
      }
    }

    // Create booking using Payload local API
    const booking = await payload.create({
      collection: 'visit-bookings',
      data: {
        property: body.property,
        visitDate: body.visitDate,
        notes: body.notes,
        customer: body.customer,
        guestUser: body.guestUser,
      },
    })

    return NextResponse.json({ success: true, booking })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
