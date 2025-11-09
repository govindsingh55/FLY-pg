import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateStaffSession, staffRateLimiter } from '@/lib/auth/staff-auth'

// GET /api/custom/staff/users
// Get all staff members (for assignment dropdowns)
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

    // Only managers and admins can list staff
    if (user.role !== 'manager' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      role: {
        in: ['chef', 'cleaning', 'security', 'maintenance', 'manager', 'admin'],
      },
    }

    // Filter by specific role if provided
    if (role) {
      where.role = { equals: role }
    }

    const users = await payload.find({
      collection: 'users',
      where,
      limit: 100,
      sort: 'name',
    })

    return NextResponse.json({
      staff: users.docs.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    })
  } catch (error) {
    console.error('Error fetching staff users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
