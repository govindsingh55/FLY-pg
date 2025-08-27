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

    const body = await request.json()
    const { type, description, property } = body

    if (!type || !description) {
      return NextResponse.json({ error: 'Type and description are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const ticket = await payload.create({
      collection: 'support-tickets',
      data: {
        customer: user.id,
        type,
        description,
        property: property || undefined,
        status: 'open',
        createdAt: new Date().toISOString(),
        conversation: [],
      },
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
