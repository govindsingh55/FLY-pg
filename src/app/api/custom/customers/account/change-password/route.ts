import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

/**
 * POST /api/custom/customers/account/change-password
 * Change customer's password
 *
 * Requires:
 * - currentPassword: Current password for verification
 * - newPassword: New password (min 8 characters)
 *
 * Process:
 * 1. Verify current password
 * 2. Validate new password strength
 * 3. Update password
 * 4. Invalidate other sessions (security)
 * 5. Send confirmation email
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - stricter for password changes
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

    const { currentPassword, newPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 },
      )
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 },
      )
    }

    // Additional password validation
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 },
      )
    }

    // Get current customer
    const customer = await payload.findByID({
      collection: 'customers',
      id: user.id,
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
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

    // Update password
    await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        password: newPassword,
      },
    })

    // TODO: Invalidate other sessions for security
    // This would require tracking active sessions and clearing them

    // TODO: Send confirmation email
    // "Your password has been successfully changed"

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
