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

    const payload = await getPayload({ config })
    const { id: ticketId } = await params
    const contentType = request.headers.get('content-type') || ''

    let message: string
    let imageId: string | undefined

    // Handle multipart form data (with file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      message = formData.get('message') as string
      const imageFile = formData.get('image') as File | null

      // Upload image to support-media collection if provided
      if (imageFile && imageFile.size > 0) {
        try {
          const buffer = Buffer.from(await imageFile.arrayBuffer())
          const uploadedMedia = await payload.create({
            collection: 'support-media',
            data: {
              alt: `Support ticket message image`,
            },
            file: {
              data: buffer,
              mimetype: imageFile.type,
              name: imageFile.name,
              size: imageFile.size,
            },
          })
          imageId = uploadedMedia.id
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          // Continue without image if upload fails
        }
      }
    } else {
      // Handle JSON
      const body = await request.json()
      message = body.message
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

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
    const newMessage: {
      sender: { relationTo: 'customers'; value: string }
      message: string
      createdAt: string
      image?: string
    } = {
      sender: {
        relationTo: 'customers' as const,
        value: user.id,
      },
      message,
      createdAt: new Date().toISOString(),
    }

    if (imageId) {
      newMessage.image = imageId
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
    console.error('Error adding message to ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
