import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateStaffSession, staffRateLimiter } from '@/lib/auth/staff-auth'

// PATCH /api/custom/staff/support/tickets/[id]/reassign
// Manager/Admin can reassign any ticket to any staff member
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown'

  if (!staffRateLimiter.isAllowed(clientIP)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const { user, error } = await validateStaffSession(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers and admins can reassign tickets
    if (user.role !== 'manager' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { staffId, note } = body

    const payload = await getPayload({ config })
    const { id: ticketId } = await params

    // Get the existing ticket
    const existingTicket = await payload.findByID({
      collection: 'support-tickets',
      id: ticketId,
      depth: 1,
    })

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Validate staff member exists if provided
    if (staffId) {
      const staffMember = await payload.findByID({
        collection: 'users',
        id: staffId,
      })

      if (!staffMember) {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
      }

      // Validate staff role matches ticket type (except for managers)
      if (staffMember.role !== 'manager' && staffMember.role !== 'admin') {
        if (existingTicket.type !== staffMember.role && existingTicket.type !== 'manager') {
          return NextResponse.json(
            {
              error: `Staff member role (${staffMember.role}) does not match ticket type (${existingTicket.type})`,
            },
            { status: 400 },
          )
        }
      }
    }

    // Add progress entry
    const progressEntry = {
      status: existingTicket.status,
      updatedBy: {
        relationTo: 'users' as const,
        value: user.id,
      },
      note:
        note || `Ticket ${staffId ? 'reassigned to staff member' : 'unassigned'} by ${user.role}`,
      updatedAt: new Date().toISOString(),
    }

    // Update ticket with new staff assignment
    const updatedTicket = await payload.update({
      collection: 'support-tickets',
      id: ticketId,
      data: {
        staff: staffId || null,
        progress: [...(existingTicket.progress || []), progressEntry],
        updatedAt: new Date().toISOString(),
      },
      depth: 2,
    })

    return NextResponse.json({ ticket: updatedTicket })
  } catch (error) {
    console.error('Error reassigning ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
