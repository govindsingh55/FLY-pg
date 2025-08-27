import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyCallbackSignatureRaw } from '@/lib/payments/phonepe'

// POST /api/custom/customers/payments/phonepe/callback
// PhonePe will hit this endpoint after user completes/cancels the payment (server-side callback/webhook).
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const rawJsonText = await req.text()
    const body = JSON.parse(rawJsonText)

    // Verify callback signature
    const endpointPath =
      process.env.PHONEPE_CALLBACK_VERIFY_PATH || '/api/custom/customers/payments/phonepe/callback'
    const headerXVerify = req.headers.get('x-verify')

    const isValidSignature = verifyCallbackSignatureRaw({
      rawJsonText,
      headerXVerify,
      endpointPath,
    })

    if (!isValidSignature) {
      console.error('Invalid PhonePe callback signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Extract transaction identifiers (shape per PhonePe docs)
    const merchantTransactionId = body?.data?.merchantTransactionId || body?.merchantTransactionId
    const transactionId = body?.data?.transactionId || body?.transactionId
    const code = body?.code || body?.data?.code
    const state = body?.data?.state || body?.state

    if (!merchantTransactionId) {
      console.error('Missing merchantTransactionId in PhonePe callback')
      return NextResponse.json({ error: 'Missing merchantTransactionId' }, { status: 400 })
    }

    // Find payment by PhonePe merchant transaction ID
    const paymentRes: any = await (payload as any).find({
      collection: 'payments',
      where: {
        phonepeMerchantTransactionId: { equals: merchantTransactionId },
      },
      depth: 1,
      limit: 1,
    })

    const payment = paymentRes?.docs?.[0]
    if (!payment) {
      console.error(`Payment not found for merchantTransactionId: ${merchantTransactionId}`)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Determine payment status based on PhonePe response
    let paymentStatus = 'pending'
    let paidDate = null

    if (state === 'PAYMENT_SUCCESS' || code === 'PAYMENT_SUCCESS') {
      paymentStatus = 'completed'
      paidDate = new Date().toISOString()
    } else if (state === 'PAYMENT_ERROR' || code === 'PAYMENT_ERROR') {
      paymentStatus = 'failed'
    } else if (state === 'PAYMENT_PENDING' || code === 'PAYMENT_PENDING') {
      paymentStatus = 'pending'
    }

    // Update payment status
    try {
      await (payload as any).update({
        collection: 'payments',
        id: payment.id,
        data: {
          status: paymentStatus,
          gateway: 'phonepe',
          phonepeMerchantTransactionId: merchantTransactionId,
          phonepeTransactionId: transactionId,
          phonepeLastCode: code,
          phonepeLastState: state,
          phonepeLastRaw: body,
          ...(paidDate && { paidDate }),
          updatedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      })

      console.log(`Payment ${payment.id} updated to status: ${paymentStatus}`)
    } catch (updateError) {
      console.error('Error updating payment status:', updateError)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }

    // Return success response to PhonePe
    return NextResponse.json({
      success: true,
      message: `Payment ${paymentStatus}`,
      paymentId: payment.id,
      status: paymentStatus,
    })
  } catch (error) {
    console.error('Error processing PhonePe callback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
