import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateStaffSession, staffRateLimiter } from '@/lib/auth/staff-auth'

// GET /api/custom/staff/support/tickets
export async function GET(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown'

  if (!staffRateLimiter.isAllowed(clientIP)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const { user, error } = await validateStaffSession(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause based on user role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    // Admins and managers see all tickets
    if (user.role === 'admin' || user.role === 'manager') {
      // No additional filters
    } else {
      // Staff see tickets assigned to them OR unassigned tickets matching their role
      where.or = [
        { staff: { equals: user.id } },
        {
          staff: { exists: false },
          type: { equals: user.role },
        },
      ]
    }

    // Filter by status if provided
    if (status) {
      where.status = { equals: status }
    }

    const tickets = await payload.find({
      collection: 'support-tickets',
      where,
      sort: '-createdAt',
      page,
      limit,
      depth: 2,
    })

    return NextResponse.json({
      tickets: tickets.docs,
      total: tickets.totalDocs,
      page: tickets.page,
      totalPages: tickets.totalPages,
      hasNextPage: tickets.hasNextPage,
      hasPrevPage: tickets.hasPrevPage,
    })
  } catch (error) {
    console.error('Error fetching staff support tickets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
