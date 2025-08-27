import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.text()
    const signature = req.headers.get('x-verify') || req.headers.get('x-webhook-signature')

    // Verify webhook signature for security
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const webhookData = JSON.parse(body)

    // Extract payment details from webhook
    const {
      merchantTransactionId,
      transactionId,
      amount,
      status,
      code,
      state,
      responseCode,
      responseMessage,
    } = webhookData

    if (!merchantTransactionId) {
      return NextResponse.json({ error: 'Missing merchant transaction ID' }, { status: 400 })
    }

    // Find the payment record
    const payments = await payload.find({
      collection: 'payments',
      where: {
        phonepeMerchantTransactionId: {
          equals: merchantTransactionId,
        },
      },
      limit: 1,
    })

    if (payments.docs.length === 0) {
      console.error('Payment not found for merchant transaction ID:', merchantTransactionId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const payment = payments.docs[0]

    // Update payment status based on webhook data
    let paymentStatus = 'pending'
    let paymentDate = null

    if (status === 'PAYMENT_SUCCESS' || code === 'PAYMENT_SUCCESS') {
      paymentStatus = 'completed'
      paymentDate = new Date().toISOString()
    } else if (status === 'PAYMENT_ERROR' || code === 'PAYMENT_ERROR') {
      paymentStatus = 'failed'
    } else if (status === 'PAYMENT_DECLINED' || code === 'PAYMENT_DECLINED') {
      paymentStatus = 'failed'
    }

    // Update payment record
    const updateData: any = {
      status: paymentStatus,
      phonepeLastRaw: webhookData,
      phonepeLastCode: code || responseCode,
      phonepeLastState: state,
    }

    if (paymentDate) {
      updateData.paymentDate = paymentDate
    }

    // Add response message as notes if payment failed
    if (paymentStatus === 'failed' && responseMessage) {
      updateData.notes = `${payment.notes || ''}\n\nPayment failed: ${responseMessage}`.trim()
    }

    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: updateData,
    })

    // Log the webhook for debugging
    console.log('Payment webhook processed:', {
      merchantTransactionId,
      transactionId,
      paymentId: payment.id,
      status: paymentStatus,
      amount,
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    })
  } catch (error: unknown) {
    console.error('Error processing payment webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  // In production, implement proper signature verification
  // For now, we'll skip verification in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  if (!signature || !process.env.PHONEPE_SALT_KEY) {
    return false
  }

  try {
    const saltKey = process.env.PHONEPE_SALT_KEY
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1'

    const concatenatedString = body + '/pg/v1/status' + saltKey + saltIndex
    const sha256Hash = crypto.createHash('sha256').update(concatenatedString).digest('hex')
    const calculatedSignature = sha256Hash + '###' + saltIndex

    return calculatedSignature === signature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}
