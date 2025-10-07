import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

/**
 * GET /api/custom/customers/settings
 * Get all settings for the authenticated customer
 *
 * Returns:
 * - notificationPreferences
 * - autoPaySettings
 * - preferences (dark mode, language, timezone, etc.)
 * - privacySettings
 */
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

    // Fetch customer with all settings fields
    const customer = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 0,
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Extract and structure settings
    const settings = {
      notifications: {
        email: customer.notificationPreferences?.emailNotifications ?? true,
        sms: customer.notificationPreferences?.smsNotifications ?? true,
        push: customer.notificationPreferences?.pushNotifications ?? true,
        bookingReminders: customer.notificationPreferences?.bookingReminders ?? true,
        paymentReminders: customer.notificationPreferences?.paymentReminders ?? true,
        maintenanceUpdates: customer.notificationPreferences?.maintenanceUpdates ?? true,
      },
      autoPay: {
        enabled: customer.autoPayEnabled ?? false,
        paymentMethod: customer.autoPayPaymentMethod || null,
        day: customer.autoPayDay ?? 1,
        maxAmount: customer.autoPayMaxAmount || null,
        notifications: customer.autoPayNotifications ?? true,
        lastUpdated: customer.autoPayLastUpdated || null,
      },
      preferences: {
        darkMode: customer.preferences?.darkMode ?? false,
        language: customer.preferences?.language ?? 'en',
        timezone: customer.preferences?.timezone ?? 'Asia/Kolkata',
        dateFormat: customer.preferences?.dateFormat ?? 'dd/mm/yyyy',
        currency: customer.preferences?.currency ?? 'INR',
      },
      privacy: {
        profileVisibility: customer.privacySettings?.profileVisibility ?? 'private',
        showEmail: customer.privacySettings?.showEmail ?? false,
        showPhone: customer.privacySettings?.showPhone ?? false,
        allowMarketingEmails: customer.privacySettings?.allowMarketingEmails ?? false,
        twoFactorEnabled: customer.privacySettings?.twoFactorEnabled ?? false,
        twoFactorMethod: customer.privacySettings?.twoFactorMethod ?? 'sms',
        sessionTimeout: customer.privacySettings?.sessionTimeout ?? 30,
      },
      metadata: {
        settingsLastUpdated: customer.settingsLastUpdated || customer.updatedAt,
      },
    }

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/custom/customers/settings
 * Update settings for the authenticated customer
 *
 * Body can include any of:
 * - notifications: { email, sms, push, bookingReminders, paymentReminders, maintenanceUpdates }
 * - autoPay: { enabled, paymentMethod, day, maxAmount, notifications }
 * - preferences: { darkMode, language, timezone, dateFormat, currency }
 * - privacy: { profileVisibility, showEmail, showPhone, allowMarketingEmails, twoFactorEnabled, twoFactorMethod, sessionTimeout }
 */
export async function PUT(request: NextRequest) {
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

    // Validate and prepare update data
    const updateData: Record<string, unknown> = {}

    // Handle notification preferences
    if (body.notifications) {
      updateData.notificationPreferences = {
        emailNotifications: body.notifications.email ?? true,
        smsNotifications: body.notifications.sms ?? true,
        pushNotifications: body.notifications.push ?? true,
        bookingReminders: body.notifications.bookingReminders ?? true,
        paymentReminders: body.notifications.paymentReminders ?? true,
        maintenanceUpdates: body.notifications.maintenanceUpdates ?? true,
      }
    }

    // Handle auto-pay settings
    if (body.autoPay) {
      updateData.autoPayEnabled = body.autoPay.enabled ?? false

      if (body.autoPay.paymentMethod !== undefined) {
        updateData.autoPayPaymentMethod = body.autoPay.paymentMethod
      }

      if (body.autoPay.day !== undefined) {
        // Validate day is between 1 and 28
        const day = parseInt(body.autoPay.day)
        if (day < 1 || day > 28) {
          return NextResponse.json(
            { error: 'Auto-pay day must be between 1 and 28' },
            { status: 400 },
          )
        }
        updateData.autoPayDay = day
      }

      if (body.autoPay.maxAmount !== undefined) {
        const maxAmount = parseFloat(body.autoPay.maxAmount)
        if (maxAmount < 0) {
          return NextResponse.json(
            { error: 'Auto-pay max amount cannot be negative' },
            { status: 400 },
          )
        }
        updateData.autoPayMaxAmount = maxAmount
      }

      if (body.autoPay.notifications !== undefined) {
        updateData.autoPayNotifications = body.autoPay.notifications
      }

      updateData.autoPayLastUpdated = new Date().toISOString()
    }

    // Handle user preferences
    if (body.preferences) {
      const preferences: Record<string, unknown> = {}

      if (body.preferences.darkMode !== undefined) {
        preferences.darkMode = Boolean(body.preferences.darkMode)
      }

      if (body.preferences.language) {
        const validLanguages = ['en', 'hi', 'es', 'fr', 'de']
        if (!validLanguages.includes(body.preferences.language)) {
          return NextResponse.json({ error: 'Invalid language selection' }, { status: 400 })
        }
        preferences.language = body.preferences.language
      }

      if (body.preferences.timezone) {
        // Basic timezone validation (can be enhanced)
        preferences.timezone = body.preferences.timezone
      }

      if (body.preferences.dateFormat) {
        const validFormats = ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd']
        if (!validFormats.includes(body.preferences.dateFormat)) {
          return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
        }
        preferences.dateFormat = body.preferences.dateFormat
      }

      if (body.preferences.currency) {
        const validCurrencies = ['INR', 'USD', 'EUR', 'GBP']
        if (!validCurrencies.includes(body.preferences.currency)) {
          return NextResponse.json({ error: 'Invalid currency selection' }, { status: 400 })
        }
        preferences.currency = body.preferences.currency
      }

      updateData.preferences = preferences
    }

    // Handle privacy settings
    if (body.privacy) {
      const privacySettings: Record<string, unknown> = {}

      if (body.privacy.profileVisibility) {
        const validVisibility = ['public', 'private', 'friends']
        if (!validVisibility.includes(body.privacy.profileVisibility)) {
          return NextResponse.json({ error: 'Invalid profile visibility' }, { status: 400 })
        }
        privacySettings.profileVisibility = body.privacy.profileVisibility
      }

      if (body.privacy.showEmail !== undefined) {
        privacySettings.showEmail = Boolean(body.privacy.showEmail)
      }

      if (body.privacy.showPhone !== undefined) {
        privacySettings.showPhone = Boolean(body.privacy.showPhone)
      }

      if (body.privacy.allowMarketingEmails !== undefined) {
        privacySettings.allowMarketingEmails = Boolean(body.privacy.allowMarketingEmails)
      }

      if (body.privacy.twoFactorEnabled !== undefined) {
        privacySettings.twoFactorEnabled = Boolean(body.privacy.twoFactorEnabled)
      }

      if (body.privacy.twoFactorMethod) {
        const validMethods = ['sms', 'email', 'app']
        if (!validMethods.includes(body.privacy.twoFactorMethod)) {
          return NextResponse.json({ error: 'Invalid 2FA method' }, { status: 400 })
        }
        privacySettings.twoFactorMethod = body.privacy.twoFactorMethod
      }

      if (body.privacy.sessionTimeout !== undefined) {
        const timeout = parseInt(body.privacy.sessionTimeout)
        if (timeout < 5 || timeout > 1440) {
          return NextResponse.json(
            { error: 'Session timeout must be between 5 and 1440 minutes' },
            { status: 400 },
          )
        }
        privacySettings.sessionTimeout = timeout
      }

      updateData.privacySettings = privacySettings
    }

    // Update settings timestamp
    updateData.settingsLastUpdated = new Date().toISOString()

    // Update customer record
    const updatedCustomer = await payload.update({
      collection: 'customers',
      id: user.id,
      data: updateData,
    })

    // Return updated settings in the same format as GET
    const settings = {
      notifications: {
        email: updatedCustomer.notificationPreferences?.emailNotifications ?? true,
        sms: updatedCustomer.notificationPreferences?.smsNotifications ?? true,
        push: updatedCustomer.notificationPreferences?.pushNotifications ?? true,
        bookingReminders: updatedCustomer.notificationPreferences?.bookingReminders ?? true,
        paymentReminders: updatedCustomer.notificationPreferences?.paymentReminders ?? true,
        maintenanceUpdates: updatedCustomer.notificationPreferences?.maintenanceUpdates ?? true,
      },
      autoPay: {
        enabled: updatedCustomer.autoPayEnabled ?? false,
        paymentMethod: updatedCustomer.autoPayPaymentMethod || null,
        day: updatedCustomer.autoPayDay ?? 1,
        maxAmount: updatedCustomer.autoPayMaxAmount || null,
        notifications: updatedCustomer.autoPayNotifications ?? true,
        lastUpdated: updatedCustomer.autoPayLastUpdated || null,
      },
      preferences: {
        darkMode: updatedCustomer.preferences?.darkMode ?? false,
        language: updatedCustomer.preferences?.language ?? 'en',
        timezone: updatedCustomer.preferences?.timezone ?? 'Asia/Kolkata',
        dateFormat: updatedCustomer.preferences?.dateFormat ?? 'dd/mm/yyyy',
        currency: updatedCustomer.preferences?.currency ?? 'INR',
      },
      privacy: {
        profileVisibility: updatedCustomer.privacySettings?.profileVisibility ?? 'private',
        showEmail: updatedCustomer.privacySettings?.showEmail ?? false,
        showPhone: updatedCustomer.privacySettings?.showPhone ?? false,
        allowMarketingEmails: updatedCustomer.privacySettings?.allowMarketingEmails ?? false,
        twoFactorEnabled: updatedCustomer.privacySettings?.twoFactorEnabled ?? false,
        twoFactorMethod: updatedCustomer.privacySettings?.twoFactorMethod ?? 'sms',
        sessionTimeout: updatedCustomer.privacySettings?.sessionTimeout ?? 30,
      },
      metadata: {
        settingsLastUpdated: updatedCustomer.settingsLastUpdated || updatedCustomer.updatedAt,
      },
    }

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
