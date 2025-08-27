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
    const url = new URL(req.url)
    const searchParams = url.searchParams

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {
      customer: { equals: user.id },
    }

    // Add status filter
    if (status && status !== 'all') {
      where.status = { equals: status }
    }

    // Add date range filter
    if (startDate || endDate) {
      where.and = []
      if (startDate) {
        where.and.push({
          createdAt: { greater_than_equal: new Date(startDate).toISOString() },
        })
      }
      if (endDate) {
        where.and.push({
          createdAt: { less_than_equal: new Date(endDate).toISOString() },
        })
      }
    }

    // Build sort clause
    const sort = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`

    // Fetch bookings
    const bookings = await payload.find({
      collection: 'bookings',
      where,
      page,
      limit,
      sort,
      depth: 2,
    })

    // Calculate additional stats
    const stats = await Promise.all([
      // Total bookings
      payload.find({
        collection: 'bookings',
        where: { customer: { equals: user.id } },
        limit: 0,
      }),
      // Active bookings
      payload.find({
        collection: 'bookings',
        where: {
          customer: { equals: user.id },
          status: { equals: 'confirmed' },
        },
        limit: 0,
      }),
      // Pending bookings
      payload.find({
        collection: 'bookings',
        where: {
          customer: { equals: user.id },
          status: { equals: 'pending' },
        },
        limit: 0,
      }),
    ])

    return NextResponse.json({
      bookings: bookings.docs,
      pagination: {
        page: bookings.page,
        limit: bookings.limit,
        totalPages: bookings.totalPages,
        totalDocs: bookings.totalDocs,
        hasNextPage: bookings.hasNextPage,
        hasPrevPage: bookings.hasPrevPage,
      },
      stats: {
        total: stats[0].totalDocs,
        active: stats[1].totalDocs,
        pending: stats[2].totalDocs,
      },
    })
  } catch (error: any) {
    console.error('Error fetching customer bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
