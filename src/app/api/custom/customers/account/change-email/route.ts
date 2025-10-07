import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

/**
 * POST /api/custom/customers/account/change-email
 * Change customer's email address
 *
 * Requires:
 * - newEmail: New email address
 * - currentPassword: Current password for verification
 *
 * Process:
 * 1. Verify current password
 * 2. Check new email is not already in use
 * 3. Update email address
 * 4. Send confirmation emails to both addresses
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
    const body = await request.json()

    const { newEmail, currentPassword } = body

    // Validate required fields
    if (!newEmail || !currentPassword) {
      return NextResponse.json(
        { error: 'New email and current password are required' },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Get current customer
    const customer = await payload.findByID({
      collection: 'customers',
      id: user.id,
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check if new email is already in use
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        email: { equals: newEmail },
      },
      limit: 1,
    })

    if (existingCustomer.docs.length > 0 && existingCustomer.docs[0].id !== user.id) {
      return NextResponse.json({ error: 'Email address already in use' }, { status: 400 })
    }

    // Verify current password
    try {
      await payload.login({
        collection: 'customers',
        data: {
          email: customer.email,
          password: currentPassword,
        },
      })
    } catch (_err) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // Update email address
    const updatedCustomer = await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        email: newEmail,
      },
    })

    // TODO: Send confirmation emails to both old and new addresses
    // This would typically involve:
    // - Email to old address: "Your email has been changed"
    // - Email to new address: "Welcome! Your email has been updated"

    return NextResponse.json({
      success: true,
      message: 'Email address updated successfully',
      email: updatedCustomer.email,
    })
  } catch (error) {
    console.error('Error changing email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
