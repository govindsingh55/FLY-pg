import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

// GET /api/custom/customers/search
// Global search across customer's data
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
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = query.trim().toLowerCase()
    const results: any[] = []

    // Search in bookings
    try {
      const bookings = await payload.find({
        collection: 'bookings',
        where: {
          and: [
            { customer: { equals: user.id } },
            {
              or: [
                { id: { contains: searchTerm } },
                { 'property.name': { contains: searchTerm } },
                { 'room.name': { contains: searchTerm } },
                { status: { contains: searchTerm } },
              ],
            },
          ],
        },
        limit: 5,
        depth: 1,
      })

      bookings.docs.forEach((booking) => {
        results.push({
          id: booking.id,
          type: 'booking',
          title: `Booking #${booking.id.slice(-6)}`,
          description: `${typeof booking.property === 'object' && booking.property?.name ? booking.property.name : 'Property'} - ${typeof booking.room === 'object' && booking.room?.name ? booking.room.name : 'Room'}`,
          status: booking.status,
          date: booking.checkInDate || booking.createdAt,
          url: `/dashboard/bookings/${booking.id}`,
          relevance: calculateRelevance(searchTerm, [
            booking.id,
            typeof booking.property === 'object' && booking.property?.name
              ? booking.property.name
              : undefined,
            typeof booking.room === 'object' && booking.room?.name ? booking.room.name : undefined,
            booking.status || undefined,
          ]),
        })
      })
    } catch (error) {
      console.error('Error searching bookings:', error)
    }

    // Search in payments
    try {
      const payments = await payload.find({
        collection: 'payments',
        where: {
          and: [
            { customer: { equals: user.id } },
            {
              or: [
                { id: { contains: searchTerm } },
                { notes: { contains: searchTerm } },
                { status: { contains: searchTerm } },
                { paymentMethod: { contains: searchTerm } },
              ],
            },
          ],
        },
        limit: 5,
        depth: 1,
      })

      payments.docs.forEach((payment) => {
        results.push({
          id: payment.id,
          type: 'payment',
          title: `Payment #${payment.id.slice(-6)}`,
          description: payment.notes || `Payment for ${payment.paymentForMonthAndYear || 'rent'}`,
          status: payment.status,
          amount: payment.amount,
          date: payment.paymentDate || payment.createdAt,
          url: `/dashboard/rent/payments/${payment.id}`,
          relevance: calculateRelevance(searchTerm, [
            payment.id,
            payment.notes || undefined,
            payment.status,
            payment.paymentMethod || undefined,
          ]),
        })
      })
    } catch (error) {
      console.error('Error searching payments:', error)
    }

    // Search in notifications
    try {
      const notifications = await payload.find({
        collection: 'notifications',
        where: {
          and: [
            { customer: { equals: user.id } },
            {
              or: [
                { title: { contains: searchTerm } },
                { message: { contains: searchTerm } },
                { category: { contains: searchTerm } },
              ],
            },
          ],
        },
        limit: 3,
        depth: 1,
      })

      notifications.docs.forEach((notification) => {
        results.push({
          id: notification.id,
          type: 'notification',
          title: notification.title,
          description: notification.message,
          status: notification.isRead ? 'read' : 'unread',
          date: notification.createdAt,
          url: `/dashboard/notifications`,
          relevance: calculateRelevance(searchTerm, [
            notification.title,
            notification.message,
            notification.category || undefined,
          ]),
        })
      })
    } catch (error) {
      console.error('Error searching notifications:', error)
    }

    // Sort by relevance and limit results
    const sortedResults = results.sort((a, b) => b.relevance - a.relevance).slice(0, 10)

    return NextResponse.json({
      success: true,
      results: sortedResults,
      total: sortedResults.length,
    })
  } catch (error) {
    console.error('Error performing global search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to calculate search relevance
function calculateRelevance(searchTerm: string, fields: (string | undefined)[]): number {
  let relevance = 0
  const term = searchTerm.toLowerCase()

  fields.forEach((field) => {
    if (!field) return

    const fieldLower = field.toLowerCase()

    // Exact match gets highest score
    if (fieldLower === term) {
      relevance += 100
    }
    // Starts with search term
    else if (fieldLower.startsWith(term)) {
      relevance += 50
    }
    // Contains search term
    else if (fieldLower.includes(term)) {
      relevance += 25
    }
    // Partial word match
    else if (term.split(' ').some((word) => fieldLower.includes(word))) {
      relevance += 10
    }
  })

  return relevance
}
