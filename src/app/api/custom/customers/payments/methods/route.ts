import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

export async function GET(req: NextRequest) {
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

    // Get customer's payment methods
    const customer = await payload.findByID({
      collection: 'customers',
      id: user.id,
    })

    // For now, return mock payment methods
    // In a real implementation, you would store these in a separate collection
    // or integrate with a payment processor like Stripe
    const mockPaymentMethods = [
      {
        id: 'pm_1',
        type: 'card' as const,
        name: 'HDFC Credit Card',
        maskedNumber: '**** **** **** 1234',
        isDefault: true,
      },
      {
        id: 'pm_2',
        type: 'upi' as const,
        name: 'UPI ID',
        maskedNumber: 'user@upi',
        isDefault: false,
      },
      {
        id: 'pm_3',
        type: 'netbanking' as const,
        name: 'SBI Net Banking',
        maskedNumber: 'SBIN0000001',
        isDefault: false,
      },
    ]

    // TODO: Replace with actual payment methods from your database
    // const paymentMethods = await payload.find({
    //   collection: 'payment-methods',
    //   where: {
    //     customer: { equals: user.id },
    //   },
    //   sort: '-isDefault',
    // })

    return NextResponse.json({
      success: true,
      paymentMethods: mockPaymentMethods,
    })
  } catch (error: any) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
    const body = await req.json()

    // Validate required fields
    const { type, name, details, isDefault } = body

    if (!type || !name || !details) {
      return NextResponse.json({ error: 'Type, name, and details are required' }, { status: 400 })
    }

    // TODO: Implement payment method creation
    // This would typically involve:
    // 1. Validating payment method details
    // 2. Storing encrypted payment method data
    // 3. Integrating with payment processor if needed
    // 4. Creating a record in your payment methods collection

    const newPaymentMethod = {
      id: `pm_${Date.now()}`,
      type,
      name,
      maskedNumber: type === 'card' ? '**** **** **** ' + details.number.slice(-4) : details.id,
      isDefault: isDefault || false,
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method added successfully',
      paymentMethod: newPaymentMethod,
    })
  } catch (error: any) {
    console.error('Error adding payment method:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
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

    const url = new URL(req.url)
    const paymentMethodId = url.searchParams.get('id')

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 })
    }

    // TODO: Implement payment method deletion
    // This would typically involve:
    // 1. Verifying the payment method belongs to the customer
    // 2. Removing it from your payment methods collection
    // 3. Optionally removing it from the payment processor

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully',
    })
  } catch (error: any) {
    console.error('Error removing payment method:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
