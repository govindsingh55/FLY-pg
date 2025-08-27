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

    // Get customer's auto-pay settings
    const customer = await payload.findByID({
      collection: 'customers',
      id: user.id,
    })

    // Default auto-pay settings
    const defaultSettings = {
      enabled: false,
      paymentMethod: '',
      paymentDay: 1,
      maxAmount: 0,
      notifications: true,
      lastUpdated: null,
    }

    // Extract auto-pay settings from customer data
    // Note: You'll need to add these fields to your Customers collection
    const settings = {
      enabled: customer.autoPayEnabled || false,
      paymentMethod: customer.autoPayPaymentMethod || '',
      paymentDay: customer.autoPayDay || 1,
      maxAmount: customer.autoPayMaxAmount || 0,
      notifications: customer.autoPayNotifications !== false, // Default to true
      lastUpdated: customer.autoPayLastUpdated || null,
    }

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error: any) {
    console.error('Error fetching auto-pay settings:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
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
    const { enabled, paymentMethod, paymentDay, maxAmount, notifications } = body

    if (enabled === undefined) {
      return NextResponse.json({ error: 'Enabled status is required' }, { status: 400 })
    }

    if (enabled) {
      if (!paymentMethod) {
        return NextResponse.json(
          { error: 'Payment method is required when enabling auto-pay' },
          { status: 400 },
        )
      }
      if (!paymentDay || paymentDay < 1 || paymentDay > 28) {
        return NextResponse.json({ error: 'Payment day must be between 1 and 28' }, { status: 400 })
      }
      if (!maxAmount || maxAmount <= 0) {
        return NextResponse.json(
          { error: 'Maximum amount must be greater than 0' },
          { status: 400 },
        )
      }
    }

    // Update customer's auto-pay settings
    const updateData: any = {
      autoPayEnabled: enabled,
      autoPayLastUpdated: new Date().toISOString(),
    }

    if (enabled) {
      updateData.autoPayPaymentMethod = paymentMethod
      updateData.autoPayDay = paymentDay
      updateData.autoPayMaxAmount = maxAmount
      updateData.autoPayNotifications = notifications
    } else {
      // Clear auto-pay settings when disabling
      updateData.autoPayPaymentMethod = ''
      updateData.autoPayDay = 1
      updateData.autoPayMaxAmount = 0
      updateData.autoPayNotifications = true
    }

    await payload.update({
      collection: 'customers',
      id: user.id,
      data: updateData,
      overrideAccess: true,
    })

    // If enabling auto-pay, you might want to create a scheduled job or webhook
    if (enabled) {
      // TODO: Implement auto-pay scheduling logic
      // This could involve creating a cron job, webhook, or using a service like Zapier
      console.log(`Auto-pay enabled for customer ${user.id} with payment day ${paymentDay}`)
    }

    return NextResponse.json({
      success: true,
      message: enabled ? 'Auto-pay enabled successfully' : 'Auto-pay disabled successfully',
      settings: {
        enabled,
        paymentMethod: enabled ? paymentMethod : '',
        paymentDay: enabled ? paymentDay : 1,
        maxAmount: enabled ? maxAmount : 0,
        notifications: enabled ? notifications : true,
        lastUpdated: updateData.autoPayLastUpdated,
      },
    })
  } catch (error: any) {
    console.error('Error updating auto-pay settings:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
