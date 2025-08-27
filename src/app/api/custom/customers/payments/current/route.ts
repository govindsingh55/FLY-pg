import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCustomerFromSession } from '@/lib/auth/customer-auth'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const customer = await getCustomerFromSession(req)

    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Get the first day of current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    // Get the last day of current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)

    // Get customer's active bookings
    const activeBookings = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          {
            customer: {
              equals: customer.id,
            },
          },
          {
            status: {
              in: ['confirmed', 'extended'],
            },
          },
          {
            startDate: {
              less_than_equal: lastDayOfMonth.toISOString(),
            },
          },
          {
            endDate: {
              greater_than_equal: firstDayOfMonth.toISOString(),
            },
          },
        ],
      },
      depth: 1,
    })

    // Get payments for current month
    const currentMonthPayments = await payload.find({
      collection: 'payments',
      where: {
        and: [
          {
            customer: {
              equals: customer.id,
            },
          },
          {
            paymentForMonthAndYear: {
              greater_than_equal: firstDayOfMonth.toISOString(),
              less_than_equal: lastDayOfMonth.toISOString(),
            },
          },
        ],
      },
      depth: 1,
    })

    // Calculate total rent for current month
    let totalRent = 0
    let totalPaid = 0
    let totalOutstanding = 0
    let totalLateFees = 0

    // Calculate rent from active bookings
    for (const booking of activeBookings.docs) {
      const bookingStart = new Date(booking.startDate)
      const bookingEnd = new Date(booking.endDate)

      // Calculate overlapping days with current month
      const overlapStart = new Date(Math.max(bookingStart.getTime(), firstDayOfMonth.getTime()))
      const overlapEnd = new Date(Math.min(bookingEnd.getTime(), lastDayOfMonth.getTime()))

      if (overlapStart < overlapEnd) {
        const overlapDays = Math.ceil(
          (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24),
        )
        const totalDays = Math.ceil(
          (bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 60 * 60 * 24),
        )
        const monthlyRent = (booking.price / totalDays) * overlapDays
        totalRent += monthlyRent
      }
    }

    // Calculate payments and late fees
    for (const payment of currentMonthPayments.docs) {
      if (payment.status === 'completed') {
        totalPaid += payment.amount
        totalLateFees += payment.lateFees || 0
      }
    }

    totalOutstanding = totalRent - totalPaid

    // Check if payment is overdue
    const today = new Date()
    const isOverdue = totalOutstanding > 0 && today.getDate() > 5 // Consider overdue after 5th of month

    // Calculate days overdue
    let daysOverdue = 0
    if (isOverdue) {
      daysOverdue = today.getDate() - 5
    }

    // Get upcoming payments
    const nextMonth = new Date(currentYear, currentMonth + 1, 1)
    const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0)

    const upcomingPayments = await payload.find({
      collection: 'payments',
      where: {
        and: [
          {
            customer: {
              equals: customer.id,
            },
          },
          {
            paymentForMonthAndYear: {
              greater_than_equal: nextMonth.toISOString(),
              less_than_equal: nextMonthEnd.toISOString(),
            },
          },
          {
            status: {
              equals: 'pending',
            },
          },
        ],
      },
      depth: 1,
    })

    return NextResponse.json({
      currentMonth: {
        month: currentMonth + 1,
        year: currentYear,
        name: new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      },
      rent: {
        total: Math.round(totalRent * 100) / 100,
        paid: Math.round(totalPaid * 100) / 100,
        outstanding: Math.round(totalOutstanding * 100) / 100,
        lateFees: Math.round(totalLateFees * 100) / 100,
      },
      status: {
        isOverdue,
        daysOverdue,
        isPaid: totalOutstanding <= 0,
        paymentDueDate: new Date(currentYear, currentMonth, 5).toISOString(),
      },
      upcomingPayments: upcomingPayments.docs.length,
      activeBookings: activeBookings.docs.length,
    })
  } catch (error: unknown) {
    console.error('Error fetching current month rent status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
