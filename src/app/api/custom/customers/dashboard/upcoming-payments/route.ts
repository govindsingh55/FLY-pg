import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

/**
 * GET /api/custom/customers/dashboard/upcoming-payments
 * Get upcoming payments for the authenticated customer
 *
 * Returns pending payments due within the next 30 days (or custom days parameter)
 * Includes property and room details from the associated booking
 *
 * Query Parameters:
 * - days: Number of days to look ahead (default: 30)
 * - limit: Maximum number of payments to return (default: 5)
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    if (!customerRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validate customer session
    const { user, error } = await validateCustomerSession(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const daysAhead = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '5')

    // Calculate date range
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    // Fetch pending payments due within the specified timeframe
    const upcomingPayments = await payload.find({
      collection: 'payments',
      where: {
        and: [
          { customer: { equals: user.id } },
          { status: { equals: 'pending' } },
          {
            dueDate: {
              greater_than_equal: now.toISOString(),
              less_than_equal: futureDate.toISOString(),
            },
          },
        ],
      },
      sort: 'dueDate', // Sort by due date ascending (earliest first)
      limit,
      depth: 2, // Depth 2 to get property and room details through booking
    })

    // Format the payments with enriched data
    const formattedPayments = await Promise.all(
      upcomingPayments.docs.map(async (payment) => {
        let propertyName = 'Unknown Property'
        let roomName = 'Unknown Room'
        let propertyLocation = ''
        let bookingId = null

        // Try to get property and room details from the booking
        if (payment.payfor && typeof payment.payfor === 'object') {
          const booking = payment.payfor as unknown as Record<string, unknown>
          bookingId = booking.id as string

          // Get property details
          if (booking.property && typeof booking.property === 'object') {
            const property = booking.property as Record<string, unknown>
            propertyName = (property.name as string) || propertyName
            // Property address is a complex object, extract string safely
            if (property.address && typeof property.address === 'object') {
              propertyLocation = 'Address on file'
            }
          }

          // Get room details (check both room and roomSnapshot)
          if (booking.room && typeof booking.room === 'object') {
            const room = booking.room as Record<string, unknown>
            roomName = (room.name as string) || roomName
          } else if (booking.roomSnapshot && typeof booking.roomSnapshot === 'object') {
            const roomSnapshot = booking.roomSnapshot as Record<string, unknown>
            roomName = (roomSnapshot.name as string) || roomName
          }
        } else if (
          payment.bookingSnapshot &&
          typeof payment.bookingSnapshot === 'object' &&
          !Array.isArray(payment.bookingSnapshot)
        ) {
          // Fallback to booking snapshot if available
          const snapshot = payment.bookingSnapshot as Record<string, unknown>
          propertyName = (snapshot.propertyName as string) || propertyName
          roomName = (snapshot.roomName as string) || roomName
        }

        // Calculate days until due
        const dueDate = new Date(payment.dueDate)
        const timeDiff = dueDate.getTime() - now.getTime()
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24))

        // Determine if overdue (shouldn't be for upcoming, but check anyway)
        const isOverdue = daysUntilDue < 0

        return {
          id: payment.id,
          amount: payment.amount,
          dueDate: payment.dueDate,
          paymentForMonthAndYear: payment.paymentForMonthAndYear,
          status: payment.status,
          property: {
            name: propertyName,
            location: propertyLocation,
          },
          room: {
            name: roomName,
          },
          booking: {
            id: bookingId,
          },
          daysUntilDue,
          isOverdue,
          notes: payment.notes,
          lateFees: payment.lateFees || 0,
          utilityCharges: payment.utilityCharges || 0,
          totalAmount: payment.amount + (payment.lateFees || 0) + (payment.utilityCharges || 0),
        }
      }),
    )

    // Calculate summary statistics
    const totalUpcoming = formattedPayments.length
    const totalAmount = formattedPayments.reduce((sum, payment) => sum + payment.totalAmount, 0)
    const nearestPayment = formattedPayments[0] || null

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      summary: {
        totalUpcoming,
        totalAmount,
        daysAhead,
        nearestPayment: nearestPayment
          ? {
              id: nearestPayment.id,
              amount: nearestPayment.totalAmount,
              dueDate: nearestPayment.dueDate,
              daysUntilDue: nearestPayment.daysUntilDue,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Error fetching upcoming payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
