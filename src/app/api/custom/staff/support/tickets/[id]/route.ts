import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateStaffSession } from '@/lib/auth/staff-auth'

// GET /api/custom/staff/support/tickets/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, error } = await validateStaffSession(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    const ticket = await payload.findByID({
      collection: 'support-tickets',
      id,
      depth: 2,
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Access control check
    const isManagerOrAdmin = user.role === 'manager' || user.role === 'admin'
    const isAssigned =
      typeof ticket.staff === 'object' && ticket.staff && ticket.staff.id === user.id
    const isUnassignedAndMatchingRole = !ticket.staff && ticket.type === user.role

    if (!isManagerOrAdmin && !isAssigned && !isUnassignedAndMatchingRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/custom/staff/support/tickets/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, error } = await validateStaffSession(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, note } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const ticket = await payload.findByID({
      collection: 'support-tickets',
      id,
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Validate status transition permissions
    if (status === 'closed' && user.role !== 'manager' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only managers can close tickets' }, { status: 403 })
    }

    // Update ticket
    const updatedTicket = await payload.update({
      collection: 'support-tickets',
      id,
      data: {
        status,
        progress: [
          ...(ticket.progress || []),
          {
            status,
            updatedBy: {
              relationTo: 'users',
              value: user.id,
            },
            note: note || `Status updated to ${status}`,
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    })

    return NextResponse.json({ ticket: updatedTicket })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
