import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { validateCustomerSession } from '@/lib/auth/customer-auth'
import { customerRateLimiter } from '@/lib/auth/customer-auth'
import config from '@payload-config'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    if (!customerRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validate customer session
    const { user: customer, error } = await validateCustomerSession(request)
    if (!customer) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const { id: paymentId } = await params

    // Fetch the payment and verify ownership
    const payment = await payload.find({
      collection: 'payments',
      where: {
        and: [{ id: { equals: paymentId } }, { customer: { equals: customer.id } }],
      },
      depth: 1,
    })

    if (!payment.docs.length) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const paymentDoc = payment.docs[0]

    // Check if payment has a receipt
    if (!paymentDoc.paymentReceipt) {
      return NextResponse.json({ error: 'Receipt not available' }, { status: 404 })
    }

    // Handle receipt based on its type
    let receiptUrl: string

    if (typeof paymentDoc.paymentReceipt === 'string') {
      // If it's a string URL
      receiptUrl = paymentDoc.paymentReceipt
    } else if (
      paymentDoc.paymentReceipt &&
      typeof paymentDoc.paymentReceipt === 'object' &&
      'url' in paymentDoc.paymentReceipt &&
      paymentDoc.paymentReceipt.url
    ) {
      // If it's a Media object
      receiptUrl = paymentDoc.paymentReceipt.url
    } else {
      return NextResponse.json({ error: 'Invalid receipt format' }, { status: 400 })
    }

    // If it's a direct URL, redirect to it
    if (receiptUrl.startsWith('http')) {
      return NextResponse.redirect(receiptUrl)
    }

    // If it's a relative path, construct the full URL
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const fullReceiptUrl = new URL(receiptUrl, baseUrl)

    return NextResponse.redirect(fullReceiptUrl)
  } catch (error) {
    console.error('Error downloading payment receipt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
