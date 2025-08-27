import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

export async function GET(req: NextRequest) {
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

    // Get customer profile with populated fields
    const customer = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 2,
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error: any) {
    console.error('Error fetching customer profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
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
    const body = await req.json()

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Update customer profile
    const updatedCustomer = await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        // Add other fields as they become available in the collection
        ...body,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      customer: updatedCustomer,
      message: 'Profile updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating customer profile:', error)

    if (error.errors) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
