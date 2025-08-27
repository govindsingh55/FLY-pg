import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

// DELETE /api/custom/customers/notifications/[id]
// Delete a specific notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id: notificationId } = await params

    // Fetch the notification and verify ownership
    const notification = await payload.find({
      collection: 'notifications',
      where: {
        and: [{ id: { equals: notificationId } }, { customer: { equals: user.id } }],
      },
      depth: 1,
    })

    if (!notification.docs.length) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Delete the notification
    await payload.delete({
      collection: 'notifications',
      id: notificationId,
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
