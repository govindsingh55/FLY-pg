import type { AccessArgs } from 'payload'

const bookingsAccess = {
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
import type { CollectionConfig } from 'payload'

const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: { useAsTitle: 'id' },
  access: bookingsAccess,
  hooks: {
    beforeValidate: [
      ({ data }) => {
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
        return data
      },
    ],
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true },
    { name: 'property', type: 'relationship', relationTo: 'properties', required: true },
    { name: 'room', type: 'relationship', relationTo: 'rooms', required: true },
    { name: 'foodIncluded', type: 'checkbox', defaultValue: false },
    { name: 'price', type: 'number', required: true },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
    },
    {
      name: 'periodInMonths',
      type: 'number',
      required: true,
      min: 1,
      max: 12,
      admin: { readOnly: true },
    },
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
  ],
}

export default Bookings
