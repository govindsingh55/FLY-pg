import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

/**
 * POST /api/custom/customers/account/deactivate
 * Deactivate customer account (reversible)
 *
 * Process:
 * 1. Set customer status to 'inactive'
 * 2. Pause active bookings
 * 3. Stop auto-pay if enabled
 * 4. Send confirmation email
 *
 * Note: Deactivation is reversible - customer can reactivate by logging in
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    if (!customerRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validate customer session
    const { user, error } = await validateCustomerSession(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Get current customer
    const customer = await payload.findByID({
      collection: 'customers',
      id: user.id,
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check if already inactive
    if (customer.status === 'inactive') {
      return NextResponse.json({ error: 'Account is already deactivated' }, { status: 400 })
    }

    // Update customer status to inactive
    await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        status: 'inactive',
        // Disable auto-pay when deactivating
        autoPayEnabled: false,
      },
    })

    // TODO: Pause active bookings
    // Find and update all active bookings to 'paused' status
    // const activeBookings = await payload.find({
    //   collection: 'bookings',
    //   where: {
    //     and: [
    //       { customer: { equals: user.id } },
    //       { status: { equals: 'confirmed' } }
    //     ]
    //   }
    // })
    // Update each booking status to 'paused'

    // TODO: Send deactivation confirmation email
    // Include instructions on how to reactivate

    return NextResponse.json({
      success: true,
      message: 'Account deactivated successfully',
      note: 'Your account has been deactivated. You can reactivate it anytime by logging in.',
    })
  } catch (error) {
    console.error('Error deactivating account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/custom/customers/account/deactivate
 * Reactivate a deactivated account
 *
 * Process:
 * 1. Set customer status back to 'active'
 * 2. Send welcome back email
 */
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    if (!customerRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validate customer session
    const { user, error } = await validateCustomerSession(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Reactivate account
    await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        status: 'active',
      },
    })

    // TODO: Send welcome back email

    return NextResponse.json({
      success: true,
      message: 'Account reactivated successfully',
    })
  } catch (error) {
    console.error('Error reactivating account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
