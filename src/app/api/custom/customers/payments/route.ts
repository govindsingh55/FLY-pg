import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

// POST /api/custom/customers/payments
// Create a new payment record for the customer
export async function POST(request: NextRequest) {
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
    const body = await request.json()

    const { amount, description, dueDate, paymentMethod, bookingId } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    if (!dueDate) {
      return NextResponse.json({ error: 'Due date is required' }, { status: 400 })
    }

    // Create payment record
    const payment = await payload.create({
      collection: 'payments',
      data: {
        customer: user.id,
        amount: Number(amount),
        notes: description, // Use notes field instead of description
        dueDate: new Date(dueDate).toISOString(),
        status: 'pending',
        paymentMethod: paymentMethod || 'upi', // Use valid payment method
        paymentForMonthAndYear: new Date().toISOString().slice(0, 7), // YYYY-MM format
        ...(bookingId && { payfor: bookingId }),
        bookingSnapshot: {},
      },
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        notes: payment.notes,
        dueDate: payment.dueDate,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/custom/customers/payments
// Get customer's payment history with filtering and pagination
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

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const dateFilter = searchParams.get('dateFilter')

    // Build where clause
    const whereConditions: any[] = [{ customer: { equals: user.id } }]

    if (search) {
      whereConditions.push({
        or: [
          { notes: { contains: search } }, // Use notes field instead of description
          { id: { contains: search } },
        ],
      })
    }

    if (status && status !== 'all') {
      whereConditions.push({ status: { equals: status } })
    }

    if (dateFilter && dateFilter !== 'all') {
      const now = new Date()
      let startDate: Date
      let endDate: Date

      switch (dateFilter) {
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          break
        case 'last_3_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
          endDate = now
          break
        case 'last_6_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
          endDate = now
          break
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = new Date(now.getFullYear(), 11, 31)
          break
        default:
          startDate = new Date(0)
          endDate = now
      }

      whereConditions.push({
        createdAt: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
      })
    }

    // Fetch payments with pagination
    const payments = await payload.find({
      collection: 'payments',
      where: {
        and: whereConditions,
      },
      sort: '-createdAt',
      page,
      limit,
      depth: 1,
    })

    // Calculate total pages
    const totalPages = Math.ceil(payments.totalDocs / limit)

    return NextResponse.json({
      success: true,
      payments: payments.docs.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        dueDate: payment.dueDate,
        paymentDate: payment.paymentDate, // Use paymentDate instead of paidDate
        notes: payment.notes, // Use notes instead of description
        lateFees: payment.lateFees,
        utilityCharges: payment.utilityCharges,
        paymentReceipt: payment.paymentReceipt, // Use paymentReceipt instead of receiptUrl
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
      total: payments.totalDocs,
      totalPages,
      currentPage: page,
      hasNextPage: payments.hasNextPage,
      hasPrevPage: payments.hasPrevPage,
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
