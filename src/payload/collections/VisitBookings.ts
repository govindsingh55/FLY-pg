import type { AccessArgs, CollectionConfig } from 'payload'

const visitBookingsAccess = {
  // Allow anyone to create a booking (guests and authenticated users)
  create: () => true,
  update: ({ req, data }: AccessArgs) => {
    const user = req.user as { role?: string; email?: string } | undefined
    // Admins and managers can update
    if (user?.role === 'manager' || user?.role === 'admin') return true
    // Guest can update their own booking by matching email
    if (data?.guestUser?.email && user?.email && data.guestUser.email === user.email) return true
    return false
  },
  delete: ({ req, data }: AccessArgs) => {
    const user = req.user as { role?: string; email?: string } | undefined
    if (user?.role === 'admin' || user?.role === 'manager') return true
    // Guest can delete their own booking by matching email
    if (data?.guestUser?.email && user?.email && data.guestUser.email === user.email) return true
    return false
  },
  read: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string; email?: string } | undefined
    console.log('Reading visit booking:', { user })
    if (user?.role === 'admin' || user?.role === 'manager') return true
    return false
  },
}

const VisitBookings: CollectionConfig = {
  slug: 'visit-bookings',
  admin: { useAsTitle: 'id' },
  access: visitBookingsAccess,
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: false },
    {
      name: 'guestUser',
      type: 'json',
      label: 'Guest User',
      required: false,
    },
    { name: 'property', type: 'relationship', relationTo: 'properties', required: true },
    { name: 'visitDate', type: 'date', required: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'pending',
    },
    { name: 'notes', type: 'text', required: false },
    // Status change history
    {
      name: 'statusHistory',
      type: 'array',
      label: 'Status History',
      fields: [
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          required: true,
        },
        {
          name: 'changedBy',
          type: 'relationship',
          relationTo: ['users', 'customers'],
          required: true,
        },
        {
          name: 'changedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'note',
          type: 'text',
          required: false,
        },
      ],
    },
  ],
}

export default VisitBookings
