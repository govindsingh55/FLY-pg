import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

// POST /api/custom/customers/payments/[id]/admin
// Admin operations on customer payments (customer-authenticated)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!customerRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validate customer session
    const { user, error } = await validateCustomerSession(req)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const { id: paymentId } = await params
    const { action } = await req.json()

    if (!action || !['mark-completed', 'mark-failed'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use mark-completed or mark-failed' },
        { status: 400 },
      )
    }

    // Get payment record and verify ownership
    const paymentRes: any = await (payload as any).find({
      collection: 'payments',
      where: {
        and: [{ id: { equals: paymentId } }, { customer: { equals: user.id } }],
      },
      depth: 0,
      limit: 1,
    })

    const payment = paymentRes?.docs?.[0]
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found or not owned by customer' },
        { status: 404 },
      )
    }

    // Update payment status based on action
    let updateData: any = {}

    if (action === 'mark-completed') {
      updateData = {
        status: 'completed',
        paymentDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    } else if (action === 'mark-failed') {
      updateData = {
        status: 'failed',
        updatedAt: new Date().toISOString(),
      }
    }

    const updated = await (payload as any).update({
      collection: 'payments',
      id: paymentId,
      data: updateData,
      overrideAccess: true,
    })

    // If marking as completed, also confirm the booking
    if (action === 'mark-completed') {
      try {
        const bookingId = typeof updated?.payfor === 'string' ? updated.payfor : updated?.payfor?.id
        if (bookingId) {
          await (payload as any).update({
            collection: 'bookings',
            id: bookingId,
            data: { status: 'confirmed' },
            overrideAccess: true,
          })
        }
      } catch (bookingError) {
        console.error('Error updating booking status:', bookingError)
        // Don't fail the payment update if booking update fails
      }
    }

    return NextResponse.json({
      success: true,
      action,
      payment: {
        id: updated.id,
        status: updated.status,
        paymentDate: updated.paymentDate,
      },
    })
  } catch (err: any) {
    console.error('[Customer Payment Admin] Error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
