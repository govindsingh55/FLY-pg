import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { phonePeCreatePayment } from '@/lib/payments/phonepe'
import { validateCustomerSession } from '@/lib/auth/customer-auth'
import { customerRateLimiter } from '@/lib/auth/customer-auth'

// POST /api/custom/customers/payments/phonepe/initiate
// Input: { paymentId, amount?, description? }
// Output: { success, redirectUrl?, instrument?, error? }
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!customerRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validate customer session
    const { user: customer, error } = await validateCustomerSession(req)
    if (!customer) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const { paymentId, amount, description } = await req.json()

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    }

    // Fetch the payment and verify ownership
    const paymentRes: any = await (payload as any).find({
      collection: 'payments',
      where: {
        and: [{ id: { equals: paymentId } }, { customer: { equals: customer.id } }],
      },
      depth: 1,
      limit: 1,
    })

    const payment = paymentRes?.docs?.[0]
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Check if payment is already completed
    if (payment.status === 'completed') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
    if (!siteUrl) {
      return NextResponse.json({ error: 'Missing SITE_URL' }, { status: 500 })
    }

    // Use provided amount or payment amount
    const paymentAmount = amount || payment.amount
    const merchantTransactionId = `CUST-${customer.id}-${payment.id}-${Date.now()}`
    const merchantUserId = customer.id
    const amountPaise = Math.round(Number(paymentAmount) * 100)

    // Redirect to customer dashboard payment success page
    const redirectUrl = `${siteUrl}/dashboard/rent/payments/success?paymentId=${encodeURIComponent(payment.id)}&transactionId=${encodeURIComponent(merchantTransactionId)}`
    const callbackUrl = `${siteUrl}/api/custom/customers/payments/phonepe/callback`

    const result = await phonePeCreatePayment({
      amountPaise,
      merchantTransactionId,
      merchantUserId,
      redirectUrl,
      callbackUrl,
    })

    // Update payment with PhonePe transaction details
    try {
      if (result?.raw?.data?.merchantTransactionId || result?.raw?.data?.transactionId) {
        await (payload as any).update({
          collection: 'payments',
          id: payment.id,
          data: {
            status: 'pending',
            gateway: 'phonepe',
            phonepeMerchantTransactionId:
              result?.raw?.data?.merchantTransactionId || merchantTransactionId,
            phonepeTransactionId: result?.raw?.data?.transactionId,
            paymentMethod: 'phonepe',
            updatedAt: new Date().toISOString(),
          },
          overrideAccess: true,
        })
      }
    } catch (updateError) {
      console.error('Error updating payment with PhonePe details:', updateError)
      // Continue even if update fails
    }

    return NextResponse.json({
      success: result.success,
      redirectUrl: result.redirectUrl,
      instrument: result.instrument,
      transactionId: merchantTransactionId,
      amount: paymentAmount,
    })
  } catch (err: any) {
    console.error('Error initiating PhonePe payment:', err)
    return NextResponse.json(
      {
        error: err?.message || 'Internal error',
      },
      { status: 500 },
    )
  }
}
