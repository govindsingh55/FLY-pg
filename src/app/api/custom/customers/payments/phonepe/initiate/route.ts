import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'
import { phonePeCreatePayment } from '@/lib/payments/phonepe'

// POST /api/custom/customers/payments/phonepe/initiate
// Initiate PhonePe payment for existing payment record (customer-authenticated)
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
    const { paymentId } = await req.json()

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
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

    // Check if payment is already completed
    if (payment.status === 'completed') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
    if (!siteUrl) {
      return NextResponse.json({ error: 'Missing SITE_URL' }, { status: 500 })
    }

    // Generate merchant order ID based on payment type
    const merchantOrderId = payment.payfor
      ? `BOOK-${payment.id}`
      : `CUST-${user.id}-${payment.id}-${Date.now()}`
    const amountPaise = Math.round(Number(payment.amount) * 100)

    // Determine redirect URL based on payment type
    const redirectUrl = payment.payfor
      ? `${siteUrl}/payments/success?paymentId=${encodeURIComponent(payment.id)}`
      : `${siteUrl}/dashboard/rent/payments/success?paymentId=${encodeURIComponent(payment.id)}&transactionId=${encodeURIComponent(merchantOrderId)}`

    console.log('[Customer PhonePe Initiate] Payment parameters:', {
      paymentId: payment.id,
      merchantOrderId,
      amountPaise,
      amountOriginal: payment.amount,
      redirectUrl,
    })

    const result = await phonePeCreatePayment({
      amountPaise,
      merchantOrderId,
      redirectUrl,
    })

    console.log('[Customer PhonePe Initiate] phonePeCreatePayment result:', result)

    if (!result.success) {
      console.error('[Customer PhonePe Initiate] PhonePe API call was not successful')
      return NextResponse.json(
        {
          error: 'Failed to get payment URL from PhonePe',
          details: result.raw,
        },
        { status: 500 },
      )
    }

    if (!result.redirectUrl) {
      console.error('[Customer PhonePe Initiate] No redirect URL returned from PhonePe')
      return NextResponse.json(
        {
          error: 'Failed to get payment URL from PhonePe',
          details: result.raw,
        },
        { status: 500 },
      )
    }

    // Update payment with PhonePe transaction details
    try {
      if (result?.raw?.orderId || result?.raw?.data?.merchantTransactionId) {
        console.log('[Customer PhonePe Initiate] Updating payment with PhonePe transaction details')

        await (payload as any).update({
          collection: 'payments',
          id: payment.id,
          data: {
            gateway: 'phonepe',
            merchantOrderId: merchantOrderId,
            status: 'initiated',
            phonepeLastRaw: result.raw,
            phonepeLastCode: result.raw?.code,
            phonepeLastState: result.raw?.data?.state,
            updatedAt: new Date().toISOString(),
          },
          overrideAccess: true,
        })

        console.log('[Customer PhonePe Initiate] Payment updated successfully')
      } else {
        console.log('[Customer PhonePe Initiate] No transaction details to update')
      }
    } catch (updateError) {
      console.error(
        '[Customer PhonePe Initiate] Error updating payment with PhonePe details:',
        updateError,
      )
    }

    console.log('[Customer PhonePe Initiate] Returning success response')

    return NextResponse.json({
      success: result.success,
      redirectUrl: result.redirectUrl,
      instrument: result.instrument,
      transactionId: merchantOrderId,
      amount: payment.amount,
    })
  } catch (err: any) {
    console.error('[Customer PhonePe Initiate] Error:', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
