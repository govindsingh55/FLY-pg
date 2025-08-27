import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

// POST /api/custom/customers/support/tickets/[id]/message
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown'

  if (!customerRateLimiter.isAllowed(clientIP)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const { user, error } = await validateCustomerSession(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message } = body

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

    // Verify the customer owns this ticket
    if (existingTicket.customer !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Add the new message to conversation
    const newMessage = {
      sender: user.id,
      message,
      createdAt: new Date().toISOString(),
    }

    const updatedTicket = await payload.update({
      collection: 'support-tickets',
      id: ticketId,
      data: {
        conversation: [...(existingTicket.conversation || []), newMessage],
        updatedAt: new Date().toISOString(),
      },
      depth: 1,
    })

    return NextResponse.json({ ticket: updatedTicket })
  } catch (error) {
    console.error('Error adding message to ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
