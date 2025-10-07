import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

/**
 * GET /api/custom/customers/dashboard/stats
 * Get dashboard statistics for the authenticated customer
 *
 * Returns:
 * - activeBookingsCount: Number of active bookings
 * - monthlyRent: Total monthly rent from active bookings
 * - paymentStatus: Status of pending payments (up_to_date, pending, overdue)
 * - totalSpent: Total amount spent on completed payments
 * - nextPaymentDue: Date of next payment due
 * - nextPaymentAmount: Amount of next payment
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

    // 1. Get active bookings count and calculate monthly rent
    const activeBookings = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { customer: { equals: user.id } },
          {
            or: [{ status: { equals: 'confirmed' } }, { status: { equals: 'active' } }],
          },
        ],
      },
      limit: 100, // Reasonable limit for active bookings
      depth: 1,
    })

    const activeBookingsCount = activeBookings.totalDocs

    // Calculate total monthly rent from active bookings
    let monthlyRent = 0
    if (activeBookings.docs.length > 0) {
      monthlyRent = activeBookings.docs.reduce((sum, booking) => {
        // Use the booking price (which should be monthly)
        return sum + (booking.price || 0)
      }, 0)
    }

    // 2. Get payment status - check for pending and overdue payments
    const now = new Date()

    // Get all pending payments
    const pendingPayments = await payload.find({
      collection: 'payments',
      where: {
        and: [{ customer: { equals: user.id } }, { status: { equals: 'pending' } }],
      },
      sort: 'dueDate',
      limit: 100,
      depth: 0,
    })

    // Check if any are overdue
    const overduePayments = pendingPayments.docs.filter((payment) => {
      const dueDate = new Date(payment.dueDate)
      return dueDate < now
    })

    // Determine payment status
    let paymentStatus = 'up_to_date'
    let nextPaymentDue: string | null = null
    let nextPaymentAmount = 0

    if (overduePayments.length > 0) {
      paymentStatus = 'overdue'
      // Get the most overdue payment
      const mostOverdue = overduePayments[0]
      nextPaymentDue = mostOverdue.dueDate
      nextPaymentAmount = mostOverdue.amount
    } else if (pendingPayments.docs.length > 0) {
      paymentStatus = 'pending'
      // Get the next upcoming payment
      const nextPayment = pendingPayments.docs[0]
      nextPaymentDue = nextPayment.dueDate
      nextPaymentAmount = nextPayment.amount
    }

    // 3. Calculate total spent from completed payments
    const completedPayments = await payload.find({
      collection: 'payments',
      where: {
        and: [{ customer: { equals: user.id } }, { status: { equals: 'completed' } }],
      },
      limit: 1000, // Get all completed payments for accurate total
      depth: 0,
    })

    const totalSpent = completedPayments.docs.reduce((sum, payment) => {
      return sum + (payment.amount || 0)
    }, 0)

    // 4. Calculate days until next payment
    let daysUntilPayment: number | null = null
    if (nextPaymentDue) {
      const dueDateObj = new Date(nextPaymentDue)
      const timeDiff = dueDateObj.getTime() - now.getTime()
      daysUntilPayment = Math.ceil(timeDiff / (1000 * 3600 * 24))
    }

    // Return statistics
    return NextResponse.json({
      success: true,
      stats: {
        activeBookingsCount,
        monthlyRent,
        paymentStatus,
        totalSpent,
        nextPaymentDue,
        nextPaymentAmount,
        daysUntilPayment,
        pendingPaymentsCount: pendingPayments.totalDocs,
        overduePaymentsCount: overduePayments.length,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
