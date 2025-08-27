import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

// GET /api/custom/customers/notifications
// Get customer's notifications with filtering and pagination
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const filter = searchParams.get('filter') // 'all', 'unread', 'read'
    const category = searchParams.get('category') // 'all', 'booking', 'payment', etc.
    const priority = searchParams.get('priority') // 'all', 'low', 'medium', 'high'

    // Build where clause
    const whereConditions: any[] = [{ customer: { equals: user.id } }]

    // Filter by read status
    if (filter === 'unread') {
      whereConditions.push({ isRead: { equals: false } })
    } else if (filter === 'read') {
      whereConditions.push({ isRead: { equals: true } })
    }

    // Filter by category
    if (category && category !== 'all') {
      whereConditions.push({ category: { equals: category } })
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      whereConditions.push({ priority: { equals: priority } })
    }

    // Fetch notifications with pagination
    const notifications = await payload.find({
      collection: 'notifications',
      where: {
        and: whereConditions,
      },
      sort: '-createdAt',
      page,
      limit,
      depth: 1,
    })

    // Calculate total pages
    const totalPages = Math.ceil(notifications.totalDocs / limit)

    return NextResponse.json({
      success: true,
      notifications: notifications.docs.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        expiresAt: notification.expiresAt,
      })),
      total: notifications.totalDocs,
      totalPages,
      currentPage: page,
      hasNextPage: notifications.hasNextPage,
      hasPrevPage: notifications.hasPrevPage,
      unreadCount: notifications.docs.filter((n) => !n.isRead).length,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/custom/customers/notifications
// Create a new notification (for testing purposes)
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

    const { title, message, type, priority, category, actionUrl, actionText } = body

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    // Create notification record
    const notification = await payload.create({
      collection: 'notifications',
      data: {
        customer: user.id,
        title,
        message,
        type: type || 'info',
        priority: priority || 'medium',
        category: category || 'general',
        isRead: false,
        actionUrl,
        actionText,
        expiresAt: body.expiresAt ? new Date(body.expiresAt).toISOString() : null,
      },
    })

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        expiresAt: notification.expiresAt,
      },
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
