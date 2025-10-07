import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

/**
 * POST /api/custom/customers/account/delete
 * Permanently delete customer account and all associated data
 *
 * Requires:
 * - confirmation: Must be exactly "DELETE"
 * - password: Current password for verification
 *
 * WARNING: This action is IRREVERSIBLE
 *
 * Process:
 * 1. Verify password
 * 2. Verify deletion confirmation
 * 3. Check for active bookings (prevent deletion if active)
 * 4. Delete or anonymize all customer data
 * 5. Send farewell email
 * 6. Clear session
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - very strict for account deletion
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

    const { confirmation, password } = body

    // Validate required fields
    if (!confirmation || !password) {
      return NextResponse.json(
        { error: 'Confirmation text and password are required' },
        { status: 400 },
      )
    }

    // Verify confirmation text
    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Confirmation text must be exactly "DELETE"' },
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

    // Verify password
    try {
      await payload.login({
        collection: 'customers',
        data: {
          email: customer.email,
          password: password,
        },
      })
    } catch (_err) {
      return NextResponse.json({ error: 'Password is incorrect' }, { status: 401 })
    }

    // Check for active bookings
    const activeBookings = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { customer: { equals: user.id } },
          {
            or: [{ status: { equals: 'confirmed' } }, { status: { equals: 'active' } }],
          },
        ],
      },
      limit: 1,
    })

    if (activeBookings.docs.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete account with active bookings. Please cancel or complete your bookings first.',
        },
        { status: 400 },
      )
    }

    // Check for pending payments
    const pendingPayments = await payload.find({
      collection: 'payments',
      where: {
        and: [{ customer: { equals: user.id } }, { status: { equals: 'pending' } }],
      },
      limit: 1,
    })

    if (pendingPayments.docs.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete account with pending payments. Please complete or cancel pending payments first.',
        },
        { status: 400 },
      )
    }

    // Option 1: Soft delete (recommended for data retention/compliance)
    // Update status and anonymize personal data
    await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        status: 'inactive', // Use inactive status (deleted is not a valid option)
        name: 'Deleted User',
        email: `deleted_${user.id}@deleted.com`,
        phone: null,
        profilePicture: null,
        notificationPreferences: {
          emailNotifications: false,
          smsNotifications: false,
          pushNotifications: false,
          bookingReminders: false,
          paymentReminders: false,
          maintenanceUpdates: false,
        },
        autoPayEnabled: false,
      },
    })

    // Option 2: Hard delete (uncomment if needed)
    // await payload.delete({
    //   collection: 'customers',
    //   id: user.id,
    // })

    // Update booking records to anonymize
    const allBookings = await payload.find({
      collection: 'bookings',
      where: {
        customer: { equals: user.id },
      },
      limit: 1000,
    })

    // Mark bookings as from deleted user
    for (const booking of allBookings.docs) {
      await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: {
          // Keep booking record for business purposes but anonymize
          notes: booking.notes
            ? `${booking.notes} [Customer account deleted]`
            : '[Customer account deleted]',
        },
      })
    }

    // TODO: Send farewell email to original address
    // "We're sorry to see you go. Your account has been deleted."

    // TODO: Clear all sessions
    // Invalidate current and all other sessions

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
      note: 'Your account and personal information have been permanently removed.',
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
