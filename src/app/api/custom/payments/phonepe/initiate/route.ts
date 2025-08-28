import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { phonePeCreatePayment } from '@/lib/payments/phonepe'

// POST /api/custom/payments/phonepe/initiate
// Input: { paymentId }
// Output: { success, redirectUrl?, instrument?, error? }
export async function POST(req: NextRequest) {
  console.log('[PhonePe Initiate] Starting payment initiation process')

  try {
    const payload = await getPayload({ config })
    console.log('[PhonePe Initiate] Payload initialized successfully')

    const body = await req.json()
    console.log('[PhonePe Initiate] Request body:', JSON.stringify(body, null, 2))

    const { paymentId } = body
    if (!paymentId) {
      console.error('[PhonePe Initiate] Missing paymentId in request')
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    }

    console.log('[PhonePe Initiate] Payment ID:', paymentId)

    const paymentRes: any = await payload.find({
      collection: 'payments',
      where: { id: { equals: paymentId } },
      depth: 0,
      limit: 1,
    })
    console.log('[PhonePe Initiate] Payment query result:', {
      found: !!paymentRes?.docs?.length,
      paymentCount: paymentRes?.docs?.length || 0,
    })

    const payment = paymentRes?.docs?.[0]
    if (!payment) {
      console.error('[PhonePe Initiate] Payment not found for ID:', paymentId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    console.log('[PhonePe Initiate] Payment found:', {
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      customer: payment.customer,
      payfor: payment.payfor,
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
    console.log('[PhonePe Initiate] Site URL:', siteUrl)

    if (!siteUrl) {
      console.error('[PhonePe Initiate] Missing SITE_URL environment variable')
      return NextResponse.json({ error: 'Missing SITE_URL' }, { status: 500 })
    }

    const merchantOrderId = `BOOK-${payment.id}`
    const amountPaise = Math.round(Number(payment.amount) * 100)

    console.log('[PhonePe Initiate] Payment parameters:', {
      merchantOrderId,
      amountPaise,
      amountOriginal: payment.amount,
    })

    const redirectUrl = `${siteUrl}/payments/success?paymentId=${encodeURIComponent(payment.id)}`

    console.log('[PhonePe Initiate] URLs:', {
      redirectUrl,
    })

    console.log('[PhonePe Initiate] Calling phonePeCreatePayment with params:', {
      amountPaise,
      merchantOrderId,
      redirectUrl,
    })

    const result = await phonePeCreatePayment({
      amountPaise,
      merchantOrderId,
      redirectUrl,
    })

    console.log('[PhonePe Initiate] phonePeCreatePayment result:', result)

    if (!result.success) {
      console.error('[PhonePe Initiate] PhonePe API call was not successful')
      return NextResponse.json(
        {
          error: 'Failed to get payment URL from PhonePe',
          details: result.raw,
        },
        { status: 500 },
      )
    }

    if (!result.redirectUrl) {
      console.error('[PhonePe Initiate] No redirect URL returned from PhonePe')
      return NextResponse.json(
        {
          error: 'Failed to get payment URL from PhonePe',
          details: result.raw,
        },
        { status: 500 },
      )
    }

    // Optional: persist transaction id / state if returned
    try {
      console.log('[PhonePe Initiate] raw:', result.raw, result.raw.orderId)
      if (result?.raw?.orderId) {
        console.log('[PhonePe Initiate] Updating payment with PhonePe transaction details')

        await payload.update({
          collection: 'payments',
          id: payment.id,
          data: {
            gateway: 'phonepe',
            merchantOrderId: merchantOrderId,
            status: 'initiated',
          },
          overrideAccess: true,
        })

        console.log('[PhonePe Initiate] Payment updated successfully')
      } else {
        console.log('[PhonePe Initiate] No transaction details to update')
      }
    } catch (updateError) {
      console.error('[PhonePe Initiate] Error updating payment with PhonePe details:', updateError)
    }

    console.log('[PhonePe Initiate] Returning success response')

    return NextResponse.json({
      success: result.success,
      redirectUrl: result.redirectUrl,
      instrument: result.instrument,
    })
  } catch (err: any) {
    console.error('[PhonePe Initiate] Unexpected error:', {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
    })
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
