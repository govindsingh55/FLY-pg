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

    const paymentMethods = await payload.find({
      collection: 'payment-methods' as any, // Cast to any until types are generated
      where: {
        customer: { equals: user.id },
      },
      sort: '-isDefault',
    })

    return NextResponse.json({
      success: true,
      paymentMethods: paymentMethods.docs.map((pm: any) => ({
        id: pm.id,
        type: pm.type,
        name: pm.name,
        maskedNumber: pm.maskedNumber,
        isDefault: pm.isDefault,
        metadata: pm.metadata,
      })),
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
    const { type, name, details, isDefault, token } = body

    if (!type || !name || !details) {
      return NextResponse.json({ error: 'Type, name, and details are required' }, { status: 400 })
    }

    // Prepare payment method data
    const maskedNumber =
      type === 'card'
        ? '**** **** **** ' + (details.number ? details.number.slice(-4) : '0000')
        : details.id || 'N/A'

    // Mock token generation if not provided (For demo purposes)
    const paymentToken = token || `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // If setting as default, unset other defaults for this customer first
    if (isDefault) {
      await payload.update({
        collection: 'payment-methods' as any,
        where: {
          and: [{ customer: { equals: user.id } }, { isDefault: { equals: true } }],
        },
        data: {
          isDefault: false,
        },
      })
    }

    const newPaymentMethod = await payload.create({
      collection: 'payment-methods' as any,
      data: {
        customer: user.id,
        type,
        name,
        maskedNumber,
        token: paymentToken,
        isDefault: isDefault || false,
        metadata: details,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment method added successfully',
      paymentMethod: {
        id: newPaymentMethod.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: (newPaymentMethod as any).type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (newPaymentMethod as any).name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        maskedNumber: (newPaymentMethod as any).maskedNumber,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        isDefault: (newPaymentMethod as any).isDefault,
      },
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

    const payload = await getPayload({ config })

    // Verify ownership before delete (Payload access control handles this, but double check doesn't hurt)
    // Actually, payload.delete with access control is safer. Assuming access control is set in Collection.

    await payload.delete({
      collection: 'payment-methods' as any,
      id: paymentMethodId,
      overrideAccess: false, // Enforce access control defined in collection
      user,
    })

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully',
    })
  } catch (error: any) {
    console.error('Error removing payment method:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
