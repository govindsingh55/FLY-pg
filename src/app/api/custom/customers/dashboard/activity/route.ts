import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

/**
 * GET /api/custom/customers/dashboard/activity
 * Get recent activity feed for the authenticated customer
 *
 * Returns an array of activities from:
 * - Recent payments
 * - Booking updates
 * - Extension requests
 * - Maintenance requests (if available)
 *
 * Sorted by timestamp (most recent first)
 */

interface Activity {
  id: string
  type: 'payment' | 'booking' | 'extension' | 'maintenance'
  title: string
  description: string
  timestamp: string
  status?: string
  amount?: number
  icon?: string
}

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
    const limit = parseInt(searchParams.get('limit') || '10')

    const activities: Activity[] = []

    // 1. Fetch recent payments (last 5)
    const recentPayments = await payload.find({
      collection: 'payments',
      where: {
        customer: { equals: user.id },
      },
      sort: '-updatedAt',
      limit: 5,
      depth: 1,
    })

    // Add payment activities
    recentPayments.docs.forEach((payment) => {
      let title = ''
      let description = ''

      if (payment.status === 'completed') {
        title = 'Rent payment completed'
        description = `Successfully paid ₹${payment.amount.toLocaleString()}`
      } else if (payment.status === 'pending') {
        title = 'Payment pending'
        description = `Rent payment of ₹${payment.amount.toLocaleString()} is pending`
      } else if (payment.status === 'failed') {
        title = 'Payment failed'
        description = `Payment of ₹${payment.amount.toLocaleString()} failed`
      }

      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        title,
        description,
        timestamp: payment.updatedAt,
        status: payment.status,
        amount: payment.amount,
        icon: 'credit-card',
      })
    })

    // 2. Fetch recent booking updates (last 5)
    const recentBookings = await payload.find({
      collection: 'bookings',
      where: {
        customer: { equals: user.id },
      },
      sort: '-updatedAt',
      limit: 5,
      depth: 1,
    })

    // Add booking activities
    recentBookings.docs.forEach((booking) => {
      let title = ''
      let description = ''
      const bookingStatus = booking.status || 'unknown'

      if (bookingStatus === 'confirmed') {
        title = 'Booking confirmed'
        description = 'Your booking has been confirmed'
      } else if (bookingStatus === 'pending') {
        title = 'Booking pending'
        description = 'Your booking is awaiting confirmation'
      } else if (bookingStatus === 'cancelled') {
        title = 'Booking cancelled'
        description = 'Your booking has been cancelled'
      } else if (bookingStatus === 'completed') {
        title = 'Booking completed'
        description = 'Your stay has been completed'
      }

      // Get property name if available
      if (booking.property && typeof booking.property === 'object') {
        description = `${description} at ${booking.property.name || 'property'}`
      }

      activities.push({
        id: `booking-${booking.id}`,
        type: 'booking',
        title,
        description,
        timestamp: booking.updatedAt,
        status: bookingStatus,
        icon: 'home',
      })
    })

    // 3. Check for extension requests in bookings
    recentBookings.docs.forEach((booking) => {
      if (booking.extensionRequests && Array.isArray(booking.extensionRequests)) {
        // Get the most recent extension request
        const recentExtension = booking.extensionRequests.sort(
          (a: Record<string, unknown>, b: Record<string, unknown>) => {
            const aDate = new Date(a.requestedAt as string).getTime()
            const bDate = new Date(b.requestedAt as string).getTime()
            return bDate - aDate
          },
        )[0] as Record<string, unknown>

        if (recentExtension) {
          let description = ''
          let activityTitle = 'Extension request'

          if (recentExtension.status === 'pending') {
            description = 'Your extension request is being reviewed'
            activityTitle = 'Extension request pending'
          } else if (recentExtension.status === 'approved') {
            description = 'Your booking extension has been approved'
            activityTitle = 'Extension approved'
          } else if (recentExtension.status === 'rejected') {
            description = 'Your extension request was not approved'
            activityTitle = 'Extension rejected'
          }

          activities.push({
            id: `extension-${booking.id}-${recentExtension.requestedAt as string}`,
            type: 'extension',
            title: activityTitle,
            description,
            timestamp:
              (recentExtension.respondedAt as string) || (recentExtension.requestedAt as string),
            status: recentExtension.status as string,
            icon: 'calendar',
          })
        }
      }
    })

    // 4. Check for maintenance requests in bookings
    recentBookings.docs.forEach((booking) => {
      if (booking.maintenanceRequests && Array.isArray(booking.maintenanceRequests)) {
        // Get recent maintenance requests (limit to 2 per booking)
        const recentMaintenance = booking.maintenanceRequests
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const aDate = new Date(a.requestedAt as string).getTime()
            const bDate = new Date(b.requestedAt as string).getTime()
            return bDate - aDate
          })
          .slice(0, 2)

        recentMaintenance.forEach((maintenance: Record<string, unknown>) => {
          const maintenanceTitle = (maintenance.title as string) || 'Maintenance request'
          let description = ''

          if (maintenance.status === 'pending') {
            description = 'Maintenance request is pending'
          } else if (maintenance.status === 'in_progress') {
            description = 'Maintenance is in progress'
          } else if (maintenance.status === 'completed') {
            description = 'Maintenance has been completed'
          } else if (maintenance.status === 'cancelled') {
            description = 'Maintenance request was cancelled'
          }

          activities.push({
            id: `maintenance-${booking.id}-${maintenance.requestedAt as string}`,
            type: 'maintenance',
            title: maintenanceTitle,
            description,
            timestamp: (maintenance.resolvedAt as string) || (maintenance.requestedAt as string),
            status: maintenance.status as string,
            icon: 'alert-circle',
          })
        })
      }
    })

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    // Limit to requested number of activities
    const limitedActivities = activities.slice(0, limit)

    return NextResponse.json({
      success: true,
      activities: limitedActivities,
      total: activities.length,
    })
  } catch (error) {
    console.error('Error fetching activity feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
