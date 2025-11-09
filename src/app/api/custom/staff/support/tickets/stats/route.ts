import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateStaffSession, staffRateLimiter } from '@/lib/auth/staff-auth'

// GET /api/custom/staff/support/tickets/stats
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

    // Build base where clause based on user role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseWhere: any = {}

    // Non-admin/manager staff only see their relevant tickets
    if (user.role !== 'admin' && user.role !== 'manager') {
      baseWhere.or = [
        { staff: { equals: user.id } },
        {
          staff: { exists: false },
          type: { equals: user.role },
        },
      ]
    }

    // Get total tickets
    const total = await payload.count({
      collection: 'support-tickets',
      where: baseWhere,
    })

    // Get tickets by status
    const openTickets = await payload.count({
      collection: 'support-tickets',
      where: { ...baseWhere, status: { equals: 'open' } },
    })

    const inProgressTickets = await payload.count({
      collection: 'support-tickets',
      where: { ...baseWhere, status: { equals: 'in_progress' } },
    })

    const resolvedTickets = await payload.count({
      collection: 'support-tickets',
      where: { ...baseWhere, status: { equals: 'resolved' } },
    })

    const closedTickets = await payload.count({
      collection: 'support-tickets',
      where: { ...baseWhere, status: { equals: 'closed' } },
    })

    // Get tickets assigned to this user
    const myAssigned = await payload.count({
      collection: 'support-tickets',
      where: { staff: { equals: user.id } },
    })

    return NextResponse.json({
      total: total.totalDocs,
      open: openTickets.totalDocs,
      inProgress: inProgressTickets.totalDocs,
      resolved: resolvedTickets.totalDocs,
      closed: closedTickets.totalDocs,
      myAssigned: myAssigned.totalDocs,
    })
  } catch (err) {
    console.error('Error fetching staff ticket stats:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
