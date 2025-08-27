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

    // Get customer profile with all related data
    const customer = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 2,
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get format from query params
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'

    // Prepare profile data for export
    const profileData = {
      personal: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        dateOfBirth: customer.dateOfBirth,
        gender: customer.gender,
        occupation: customer.occupation,
        company: customer.company,
        status: customer.status,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      address: customer.address || {},
      emergencyContact: customer.emergencyContact || {},
      notificationPreferences: customer.notificationPreferences || {},
      autoPaySettings: {
        enabled: customer.autoPayEnabled || false,
        paymentDay: customer.autoPayDay,
        notifications: customer.autoPayNotifications,
      },
      profilePicture:
        customer.profilePicture && typeof customer.profilePicture === 'object'
          ? {
              id: customer.profilePicture.id,
              filename: customer.profilePicture.filename,
              url: customer.profilePicture.url,
            }
          : null,
    }

    // Get booking history
    const bookings = await payload.find({
      collection: 'bookings',
      where: {
        customer: { equals: user.id },
      },
      limit: 1000,
      depth: 1,
    })

    // Get payment history
    const payments = await payload.find({
      collection: 'payments',
      where: {
        customer: { equals: user.id },
      },
      limit: 1000,
      depth: 1,
    })

    const exportData = {
      profile: profileData,
      bookings: bookings.docs.map((booking) => ({
        id: booking.id,
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate,
        price: booking.price,
        periodInMonths: booking.periodInMonths,
        foodIncluded: booking.foodIncluded,
        createdAt: booking.createdAt,
        property:
          booking.property && typeof booking.property === 'object'
            ? {
                name: booking.property.name,
                location: booking.property.address?.location,
              }
            : null,
        room:
          booking.room && typeof booking.room === 'object'
            ? {
                name: booking.room.name,
                type: booking.room.roomType,
              }
            : null,
      })),
      payments: payments.docs.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        dueDate: payment.dueDate,
        paidAt: payment.paymentDate,
        createdAt: payment.createdAt,
      })),
      exportInfo: {
        exportedAt: new Date().toISOString(),
        format,
        totalBookings: bookings.docs.length,
        totalPayments: payments.docs.length,
      },
    }

    // Return data based on format
    switch (format.toLowerCase()) {
      case 'json':
        return NextResponse.json(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="profile-export-${Date.now()}.json"`,
          },
        })

      case 'csv':
        const csvData = convertToCSV(exportData)
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="profile-export-${Date.now()}.csv"`,
          },
        })

      default:
        return NextResponse.json(
          { error: 'Unsupported format. Use "json" or "csv"' },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error('Error exporting profile data:', error)
    return NextResponse.json({ error: 'Failed to export profile data' }, { status: 500 })
  }
}

function convertToCSV(data: any): string {
  const lines: string[] = []

  // Profile section
  lines.push('PROFILE DATA')
  lines.push('Field,Value')
  lines.push(`Name,${data.profile.personal.name || ''}`)
  lines.push(`Email,${data.profile.personal.email || ''}`)
  lines.push(`Phone,${data.profile.personal.phone || ''}`)
  lines.push(`Date of Birth,${data.profile.personal.dateOfBirth || ''}`)
  lines.push(`Gender,${data.profile.personal.gender || ''}`)
  lines.push(`Occupation,${data.profile.personal.occupation || ''}`)
  lines.push(`Company,${data.profile.personal.company || ''}`)
  lines.push(`Status,${data.profile.personal.status || ''}`)
  lines.push(`Created At,${data.profile.personal.createdAt || ''}`)
  lines.push(`Updated At,${data.profile.personal.updatedAt || ''}`)

  // Address section
  lines.push('')
  lines.push('ADDRESS')
  lines.push('Field,Value')
  lines.push(`Street,${data.profile.address.street || ''}`)
  lines.push(`City,${data.profile.address.city || ''}`)
  lines.push(`State,${data.profile.address.state || ''}`)
  lines.push(`PIN Code,${data.profile.address.pincode || ''}`)
  lines.push(`Country,${data.profile.address.country || ''}`)

  // Emergency Contact section
  lines.push('')
  lines.push('EMERGENCY CONTACT')
  lines.push('Field,Value')
  lines.push(`Name,${data.profile.emergencyContact.name || ''}`)
  lines.push(`Phone,${data.profile.emergencyContact.phone || ''}`)
  lines.push(`Relationship,${data.profile.emergencyContact.relationship || ''}`)

  // Bookings section
  if (data.bookings.length > 0) {
    lines.push('')
    lines.push('BOOKINGS')
    lines.push(
      'ID,Status,Start Date,End Date,Price,Period (Months),Food Included,Property,Room,Created At',
    )
    data.bookings.forEach((booking: any) => {
      lines.push(
        [
          booking.id,
          booking.status,
          booking.startDate,
          booking.endDate,
          booking.price,
          booking.periodInMonths,
          booking.foodIncluded ? 'Yes' : 'No',
          booking.property?.name || '',
          booking.room?.name || '',
          booking.createdAt,
        ].join(','),
      )
    })
  }

  // Payments section
  if (data.payments.length > 0) {
    lines.push('')
    lines.push('PAYMENTS')
    lines.push('ID,Amount,Status,Payment Method,Due Date,Paid At,Created At')
    data.payments.forEach((payment: any) => {
      lines.push(
        [
          payment.id,
          payment.amount,
          payment.status,
          payment.paymentMethod,
          payment.dueDate,
          payment.paidAt,
          payment.createdAt,
        ].join(','),
      )
    })
  }

  return lines.join('\n')
}
