import type { AccessArgs, CollectionConfig } from 'payload'

const visitBookingsAccess = {
  create: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'customer' || user?.role === 'admin' || user?.role === 'manager'
  },
  update: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
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

const VisitBookings: CollectionConfig = {
  slug: 'visit-bookings',
  admin: { useAsTitle: 'id' },
  access: visitBookingsAccess,
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true },
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
