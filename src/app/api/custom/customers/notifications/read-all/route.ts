import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

// PUT /api/custom/customers/notifications/read-all
// Mark all notifications as read for the customer
export async function PUT(request: NextRequest) {
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

    // Find all unread notifications for the customer
    const unreadNotifications = await payload.find({
      collection: 'notifications',
      where: {
        and: [{ customer: { equals: user.id } }, { isRead: { equals: false } }],
      },
      limit: 1000, // Large limit to get all unread notifications
    })

    // Update all unread notifications to mark as read
    const updatePromises = unreadNotifications.docs.map((notification) =>
      payload.update({
        collection: 'notifications',
        id: notification.id,
        data: {
          isRead: true,
          readAt: new Date().toISOString(),
        },
      }),
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `Marked ${unreadNotifications.docs.length} notifications as read`,
      updatedCount: unreadNotifications.docs.length,
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
