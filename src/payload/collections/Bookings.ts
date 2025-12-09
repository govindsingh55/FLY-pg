import type { AccessArgs } from 'payload'
import type { CollectionConfig } from 'payload'

const bookingsAccess = {
  create: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'customer' || user?.role === 'admin' || user?.role === 'manager'
  },
  update: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    // Strictly limit update to manager and admin
    return user?.role === 'manager' || user?.role === 'admin'
  },
  delete: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'admin' || user?.role === 'manager'
  },
  read: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string; id?: string | number } | undefined
    if (!user) return false
    if (user.role === 'customer') {
      return {
        customer: { equals: user.id },
      }
    }
    return true
  },
}

const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'bookingTitle',
    defaultColumns: ['bookingTitle', 'customer', 'property', 'room', 'status', 'checkInDate'],
    listSearchableFields: ['bookingTitle', 'id'],
  },
  access: bookingsAccess,
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (!data) return data

        const payload = req.payload

        // Auto-populate pricing fields from property/room if not already set
        if (operation === 'create' || !data.roomRent) {
          try {
            // Fetch room details
            if (data.room) {
              const roomId = typeof data.room === 'string' ? data.room : data.room.id
              const room = await payload.findByID({ collection: 'rooms', id: roomId })

              if (room) {
                // Set room rent if not manually provided
                if (!data.roomRent) {
                  data.roomRent = room.rent || 0
                  console.log(`[BOOKING] Auto-populated roomRent: ${data.roomRent}`)
                }
              }
            }

            // Fetch property details for food pricing and other charges
            if (data.property) {
              const propertyId =
                typeof data.property === 'string' ? data.property : data.property.id
              const property = await payload.findByID({
                collection: 'properties',
                id: propertyId,
                depth: 1,
              })

              if (property) {
                // Set food price if food is included and not manually provided
                if (data.foodIncluded && !data.foodPrice) {
                  data.foodPrice = property.foodMenu?.price || 0
                  console.log(`[BOOKING] Auto-populated foodPrice: ${data.foodPrice}`)
                }

                // Set booking charge if not manually provided
                if (data.bookingCharge === undefined || data.bookingCharge === null) {
                  data.bookingCharge = property.bookingCharge || 0
                  console.log(`[BOOKING] Auto-populated bookingCharge: ${data.bookingCharge}`)
                }

                // Set security deposit based on property settings
                if (data.securityDeposit === undefined || data.securityDeposit === null) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const securityDepositConfig = (property as any).securityDeposit
                  if (securityDepositConfig?.type === 'fixed') {
                    data.securityDeposit = securityDepositConfig.amount || 0
                  } else if (securityDepositConfig?.type === 'multiplier' && data.roomRent) {
                    const multiplier = securityDepositConfig.multiplier || 1
                    data.securityDeposit = data.roomRent * multiplier
                  } else {
                    data.securityDeposit = 0
                  }
                  console.log(`[BOOKING] Auto-populated securityDeposit: ${data.securityDeposit}`)
                }

                // Set takeFirstMonthRentOnBooking from property settings if not set
                if (
                  data.takeFirstMonthRentOnBooking === undefined ||
                  data.takeFirstMonthRentOnBooking === null
                ) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data.takeFirstMonthRentOnBooking =
                    (property as any).takeFirstMonthRentOnBooking ?? true
                  console.log(
                    `[BOOKING] Auto-populated takeFirstMonthRentOnBooking: ${data.takeFirstMonthRentOnBooking}`,
                  )
                }
              }
            }
          } catch (error) {
            console.error('[BOOKING] Error auto-populating pricing fields:', error)
          }
        }

        // Calculate period in months
        if (data?.startDate && data?.endDate) {
          const start = new Date(data.startDate)
          const end = new Date(data.endDate)
          let months =
            (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
          if (end.getDate() >= start.getDate()) {
            months += 1
          }
          data.periodInMonths = Math.max(1, months)
        }

        // Calculate total booking amount
        if (data.roomRent !== undefined) {
          const roomRent = Number(data.roomRent) || 0
          const foodPrice = data.foodIncluded ? Number(data.foodPrice) || 0 : 0
          const bookingCharge = Number(data.bookingCharge) || 0
          const securityDeposit = Number(data.securityDeposit) || 0
          const periodInMonths = Number(data.periodInMonths) || 1
          const takeFirstMonthRent = data.takeFirstMonthRentOnBooking ?? true

          // Total = (monthlyRent * period) + bookingCharge + securityDeposit
          // If takeFirstMonthRentOnBooking is true, first month is paid upfront
          const monthlyTotal = roomRent + foodPrice
          const rentForPeriod = takeFirstMonthRent
            ? monthlyTotal + monthlyTotal * (periodInMonths - 1)
            : monthlyTotal * periodInMonths

          data.total = rentForPeriod + bookingCharge + securityDeposit

          console.log(`[BOOKING] Calculated total: ${data.total}`, {
            roomRent,
            foodPrice,
            bookingCharge,
            securityDeposit,
            periodInMonths,
            takeFirstMonthRent,
          })
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        // Populate bookingTitle after any change
        try {
          const payload = req.payload
          let customerName = 'Unknown Customer'
          let propertyName = 'Unknown Property'
          let roomName = 'Unknown Room'

          // Fetch customer name
          if (doc.customer) {
            const customerId = typeof doc.customer === 'string' ? doc.customer : doc.customer.id
            const customer = await payload.findByID({ collection: 'customers', id: customerId })
            customerName = customer?.name || customerName
          }
          // Fetch property name
          if (doc.property) {
            const propertyId = typeof doc.property === 'string' ? doc.property : doc.property.id
            const property = await payload.findByID({ collection: 'properties', id: propertyId })
            propertyName = property?.name || propertyName
          }
          // Fetch room name
          if (doc.room) {
            const roomId = typeof doc.room === 'string' ? doc.room : doc.room.id
            const room = await payload.findByID({ collection: 'rooms', id: roomId })
            roomName = room?.name || roomName
          }

          const newTitle = `${customerName} - ${propertyName} - ${roomName}`
          // Update the booking with the new title if changed
          if (doc.bookingTitle !== newTitle) {
            await payload.update({
              collection: 'bookings',
              id: doc.id,
              data: { bookingTitle: newTitle },
              draft: false,
            })
          }
        } catch (error) {
          console.error('Error updating bookingTitle:', error)
        }
      },
    ],
  },
  fields: [
    {
      name: 'bookingTitle',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-generated title: Customer Name - Property Name - Room Name',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: {
        description: 'Select the customer making this booking',
      },
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
      admin: {
        description:
          'Select the property for this booking. Pricing will be auto-populated from property settings.',
      },
    },
    {
      name: 'room',
      type: 'relationship',
      relationTo: 'rooms',
      required: true,
      admin: {
        description: 'Select the specific room. Room rent will be auto-populated.',
      },
    },
    {
      name: 'foodIncluded',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Check if food service is included. Food price will be added to monthly rent if enabled.',
      },
    },
    // Pricing breakdown
    {
      name: 'roomRent',
      type: 'number',
      required: true,
      admin: {
        description:
          'Monthly room rent at time of booking. Auto-populated from room settings, but can be overridden for custom pricing.',
        readOnly: false,
      },
    },
    {
      name: 'foodPrice',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'Monthly food charge (if food included). Auto-populated from property food menu price, but can be customized.',
        readOnly: false,
      },
    },
    {
      name: 'bookingCharge',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'One-time booking charge applied at booking time. Auto-populated from property settings, can be adjusted.',
        readOnly: false,
      },
    },
    {
      name: 'securityDeposit',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'Security deposit amount for this booking. Auto-calculated based on property settings (fixed amount or rent multiplier), can be overridden.',
        readOnly: false,
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      admin: {
        description:
          'Total booking amount for entire period. Auto-calculated: (roomRent + foodPrice) × periodInMonths + bookingCharge + securityDeposit',
        readOnly: true,
      },
    },
    {
      name: 'takeFirstMonthRentOnBooking',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'If checked, first month rent is collected at booking time. Auto-set from property settings, can be changed per booking.',
        readOnly: false,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Extended', value: 'extended' },
      ],
      defaultValue: 'pending',
      admin: {
        description:
          'Current booking status. Only "confirmed" bookings will receive monthly rent reminders.',
      },
    },
    {
      name: 'roomSnapshot',
      type: 'json',
      admin: {
        description: 'Historical snapshot of room data at booking time (auto-populated)',
      },
    },

    // Booking Date Management (optional fields for manual tracking if needed)
    {
      name: 'startDate',
      type: 'date',
      required: false,
      admin: {
        description: 'Booking period start date. Used to calculate periodInMonths and total rent.',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: false,
      admin: {
        description: 'Booking period end date. System will stop rent reminders after this date.',
      },
    },
    {
      name: 'periodInMonths',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Duration in months (auto-calculated from start and end dates)',
      },
    },
    {
      name: 'checkInDate',
      type: 'date',
      admin: {
        description: 'Actual date when customer checked in',
      },
    },
    {
      name: 'checkOutDate',
      type: 'date',
      admin: {
        description: 'Actual date when customer checked out',
      },
    },

    // Cancellation Details
    { name: 'cancellationReason', type: 'textarea' },
    { name: 'cancelledAt', type: 'date' },
    { name: 'cancelledBy', type: 'relationship', relationTo: 'customers' },
    // Extension Requests
    {
      name: 'extensionRequests',
      type: 'array',
      fields: [
        { name: 'requestedEndDate', type: 'date', required: true },
        { name: 'reason', type: 'textarea', required: true },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ],
          defaultValue: 'pending',
        },
        { name: 'requestedAt', type: 'date', defaultValue: () => new Date() },
        { name: 'respondedAt', type: 'date' },
        { name: 'responseNote', type: 'textarea' },
      ],
    },
    // Maintenance Requests
    {
      name: 'maintenanceRequests',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        {
          name: 'priority',
          type: 'select',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Urgent', value: 'urgent' },
          ],
          defaultValue: 'medium',
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Open', value: 'open' },
            { label: 'In Progress', value: 'in-progress' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Closed', value: 'closed' },
          ],
          defaultValue: 'open',
        },
        { name: 'requestedAt', type: 'date', defaultValue: () => new Date() },
        { name: 'resolvedAt', type: 'date' },
        { name: 'resolutionNote', type: 'textarea' },
      ],
    },
    // Booking Documents
    {
      name: 'bookingDocuments',
      type: 'array',
      fields: [
        { name: 'document', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Agreement', value: 'agreement' },
            { label: 'ID Proof', value: 'id-proof' },
            { label: 'Address Proof', value: 'address-proof' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
        },
        { name: 'description', type: 'text' },
        { name: 'uploadedAt', type: 'date', defaultValue: () => new Date() },
      ],
    },
    // Rating and Review
    { name: 'rating', type: 'number', min: 1, max: 5 },
    { name: 'review', type: 'textarea' },
    { name: 'reviewedAt', type: 'date' },
    // Additional Fields
    { name: 'specialRequests', type: 'textarea' },
    { name: 'notes', type: 'textarea' },
    // Booking Analytics Fields
    { name: 'totalNights', type: 'number', admin: { readOnly: true } },
    { name: 'averageDailyRate', type: 'number', admin: { readOnly: true } },
    { name: 'lastModified', type: 'date', admin: { readOnly: true } },
    { name: 'modificationCount', type: 'number', defaultValue: 0 },
    { name: 'customerSatisfactionScore', type: 'number', min: 1, max: 10 },
    {
      name: 'bookingSource',
      type: 'select',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Mobile App', value: 'mobile-app' },
        { label: 'Phone', value: 'phone' },
        { label: 'Walk-in', value: 'walk-in' },
        { label: 'Referral', value: 'referral' },
      ],
    },
  ],
}

export default Bookings
