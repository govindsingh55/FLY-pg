import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateStaffSession, staffRateLimiter } from '@/lib/auth/staff-auth'

// POST /api/custom/staff/support/tickets/[id]/message
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown'

  if (!staffRateLimiter.isAllowed(clientIP)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const { user, error } = await validateStaffSession(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, imageId } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const { id: ticketId } = await params

    // Get the existing ticket
    const existingTicket = await payload.findByID({
      collection: 'support-tickets',
      id: ticketId,
    })

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Verify staff has access to this ticket
    if (user.role !== 'admin' && user.role !== 'manager') {
      // Check if ticket is assigned to this staff member or is unassigned and matches their role
      const isAssigned = String(existingTicket.staff) === String(user.id)
      const isUnassignedAndMatches = !existingTicket.staff && existingTicket.type === user.role

      if (!isAssigned && !isUnassignedAndMatches) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Add the new message to conversation
    const newMessage = {
      sender: {
        relationTo: 'users' as const,
        value: user.id,
      },
      message,
      image: imageId || undefined,
      createdAt: new Date().toISOString(),
    }

    const updatedTicket = await payload.update({
      collection: 'support-tickets',
      id: ticketId,
      data: {
        conversation: [...(existingTicket.conversation || []), newMessage],
        updatedAt: new Date().toISOString(),
      },
      depth: 2,
    })

    return NextResponse.json({ ticket: updatedTicket })
  } catch (error) {
    console.error('Error adding staff message to ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
