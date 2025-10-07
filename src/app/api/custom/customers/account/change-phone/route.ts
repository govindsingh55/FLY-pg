import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

/**
 * POST /api/custom/customers/account/change-phone
 * Change customer's phone number
 *
 * Requires:
 * - newPhone: New phone number (10-digit Indian mobile)
 *
 * Process:
 * 1. Validate phone number format
 * 2. Check phone is not already in use
 * 3. Update phone number
 * 4. Send SMS confirmation to new number
 *
 * Note: In production, implement OTP verification:
 * - Send OTP to new number
 * - Verify OTP before updating
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

    const { newPhone } = body

    // Validate required field
    if (!newPhone) {
      return NextResponse.json({ error: 'New phone number is required' }, { status: 400 })
    }

    // Validate Indian mobile number format (10 digits, starts with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(newPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number starting with 6-9' },
        { status: 400 },
      )
    }

    // Check if phone number is already in use
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        phone: { equals: newPhone },
      },
      limit: 1,
    })

    if (existingCustomer.docs.length > 0 && existingCustomer.docs[0].id !== user.id) {
      return NextResponse.json({ error: 'Phone number already in use' }, { status: 400 })
    }

    // Update phone number
    const updatedCustomer = await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        phone: newPhone,
      },
    })

    // TODO: Send SMS verification
    // In production, implement:
    // 1. Generate OTP
    // 2. Send OTP to new phone
    // 3. Verify OTP before confirming change
    // 4. Send confirmation SMS

    return NextResponse.json({
      success: true,
      message: 'Phone number updated successfully',
      phone: updatedCustomer.phone,
    })
  } catch (error) {
    console.error('Error changing phone:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
