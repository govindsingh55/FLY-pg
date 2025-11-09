import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateStaffSession, staffRateLimiter } from '@/lib/auth/staff-auth'

// PATCH /api/custom/staff/support/tickets/[id]/assign
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

    const { id: ticketId } = await params
    const body = await request.json()
    const { action, staffId, status, note } = body

    const payload = await getPayload({ config })

    // Get the existing ticket
    const existingTicket = await payload.findByID({
      collection: 'support-tickets',
      id: ticketId,
    })

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    // Handle assignment actions
    if (action === 'claim') {
      // Staff claiming the ticket for themselves
      updateData.staff = user.id
      if (!status) {
        updateData.status = 'in_progress'
      }
    } else if (action === 'assign' && staffId) {
      // Manager/admin assigning to specific staff
      if (user.role !== 'admin' && user.role !== 'manager') {
        return NextResponse.json(
          { error: 'Only admins and managers can assign tickets to others' },
          { status: 403 },
        )
      }
      updateData.staff = staffId
    } else if (action === 'unassign') {
      // Unassigning ticket
      if (
        user.role !== 'admin' &&
        user.role !== 'manager' &&
        String(existingTicket.staff) !== String(user.id)
      ) {
        return NextResponse.json(
          { error: 'You can only unassign yourself from tickets' },
          { status: 403 },
        )
      }
      updateData.staff = null
      updateData.status = 'open'
    }

    // Handle status update
    if (status) {
      updateData.status = status

      // Add to progress history
      const progressEntry = {
        status,
        updatedBy: {
          relationTo: 'users' as const,
          value: user.id,
        },
        note: note || undefined,
        updatedAt: new Date().toISOString(),
      }

      updateData.progress = [...(existingTicket.progress || []), progressEntry]
    }

    // Update the ticket
    const updatedTicket = await payload.update({
      collection: 'support-tickets',
      id: ticketId,
      data: updateData,
      depth: 2,
    })

    return NextResponse.json({ ticket: updatedTicket })
  } catch (error) {
    console.error('Error updating ticket assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
