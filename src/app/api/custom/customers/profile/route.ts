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

    // Get customer profile with populated fields
    const customer = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 2,
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Structure response to include all fields including new settings
    return NextResponse.json({
      customer: {
        // Basic identification
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,

        // Personal information
        dateOfBirth: customer.dateOfBirth,
        gender: customer.gender,
        occupation: customer.occupation,
        company: customer.company,

        // Grouped fields
        address: customer.address,
        emergencyContact: customer.emergencyContact,
        profilePicture: customer.profilePicture,

        // Settings fields (NEW)
        preferences: customer.preferences || {
          darkMode: false,
          language: 'en',
          timezone: 'Asia/Kolkata',
          dateFormat: 'dd/mm/yyyy',
          currency: 'INR',
        },
        privacySettings: customer.privacySettings || {
          profileVisibility: 'private',
          showEmail: false,
          showPhone: false,
          allowMarketingEmails: false,
          twoFactorEnabled: false,
          twoFactorMethod: 'sms',
          sessionTimeout: 30,
        },
        notificationPreferences: customer.notificationPreferences || {
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
          bookingReminders: true,
          paymentReminders: true,
          maintenanceUpdates: true,
        },

        // Timestamps
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('Error fetching customer profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Prepare update data with validation
    const updateData: Record<string, unknown> = {}

    // Basic fields
    if (body.name) updateData.name = body.name
    if (body.email) updateData.email = body.email
    if (body.phone) updateData.phone = body.phone

    // Personal information
    if (body.dateOfBirth) updateData.dateOfBirth = body.dateOfBirth
    if (body.gender) updateData.gender = body.gender
    if (body.occupation) updateData.occupation = body.occupation
    if (body.company) updateData.company = body.company

    // Address and emergency contact
    if (body.address) updateData.address = body.address
    if (body.emergencyContact) updateData.emergencyContact = body.emergencyContact

    // Validate and update preferences (NEW)
    if (body.preferences) {
      const validLanguages = ['en', 'hi', 'es', 'fr', 'de']
      const validDateFormats = ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd']
      const validCurrencies = ['INR', 'USD', 'EUR', 'GBP']

      if (body.preferences.language && !validLanguages.includes(body.preferences.language)) {
        return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
      }
      if (body.preferences.dateFormat && !validDateFormats.includes(body.preferences.dateFormat)) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
      }
      if (body.preferences.currency && !validCurrencies.includes(body.preferences.currency)) {
        return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
      }

      updateData.preferences = body.preferences
    }

    // Validate and update privacy settings (NEW)
    if (body.privacySettings) {
      const validVisibility = ['public', 'private', 'friends']
      const validMethods = ['sms', 'email', 'app']

      if (
        body.privacySettings.profileVisibility &&
        !validVisibility.includes(body.privacySettings.profileVisibility)
      ) {
        return NextResponse.json({ error: 'Invalid profile visibility' }, { status: 400 })
      }
      if (
        body.privacySettings.twoFactorMethod &&
        !validMethods.includes(body.privacySettings.twoFactorMethod)
      ) {
        return NextResponse.json({ error: 'Invalid 2FA method' }, { status: 400 })
      }
      if (body.privacySettings.sessionTimeout !== undefined) {
        const timeout = parseInt(body.privacySettings.sessionTimeout)
        if (timeout < 5 || timeout > 1440) {
          return NextResponse.json(
            { error: 'Session timeout must be between 5 and 1440 minutes' },
            { status: 400 },
          )
        }
      }

      updateData.privacySettings = body.privacySettings
    }

    // Update notification preferences if provided (NEW)
    if (body.notificationPreferences) {
      updateData.notificationPreferences = body.notificationPreferences
    }

    // Update customer profile
    const updatedCustomer = await payload.update({
      collection: 'customers',
      id: user.id,
      data: updateData,
      overrideAccess: true,
    })

    return NextResponse.json({
      customer: updatedCustomer,
      message: 'Profile updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating customer profile:', error)

    if (error.errors) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
