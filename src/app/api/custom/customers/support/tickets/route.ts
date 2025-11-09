import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

// GET /api/custom/customers/support/tickets
export async function GET(request: NextRequest) {
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

    const tickets = await payload.find({
      collection: 'support-tickets',
      where: {
        customer: { equals: user.id },
      },
      sort: '-createdAt',
      depth: 1,
    })

    return NextResponse.json({
      tickets: tickets.docs,
      total: tickets.totalDocs,
    })
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/custom/customers/support/tickets
export async function POST(request: NextRequest) {
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
    const contentType = request.headers.get('content-type') || ''

    let type: string
    let description: string
    let property: string | undefined
    let imageId: string | undefined

    // Handle multipart form data (with file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      type = formData.get('type') as string
      description = formData.get('description') as string
      property = formData.get('property') as string | undefined
      const imageFile = formData.get('image') as File | null

      // Upload image to support-media collection if provided
      if (imageFile && imageFile.size > 0) {
        try {
          // Convert File to buffer for Payload
          const buffer = Buffer.from(await imageFile.arrayBuffer())
          const uploadedMedia = await payload.create({
            collection: 'support-media',
            data: {
              alt: `Support ticket image - ${description.substring(0, 30)}`,
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
      type = body.type
      description = body.description
      property = body.property
    }

    if (!type || !description) {
      return NextResponse.json({ error: 'Type and description are required' }, { status: 400 })
    }

    // Build initial conversation with optional image
    const initialConversation = imageId
      ? [
          {
            sender: {
              relationTo: 'customers' as const,
              value: user.id,
            },
            message: description,
            image: imageId,
            createdAt: new Date().toISOString(),
          },
        ]
      : []

    const ticket = await payload.create({
      collection: 'support-tickets',
      data: {
        customer: user.id,
        type: type as 'manager' | 'chef' | 'cleaning' | 'maintenance' | 'security',
        description,
        property: property || undefined,
        status: 'open',
        createdAt: new Date().toISOString(),
        conversation: initialConversation,
      },
      depth: 2,
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
