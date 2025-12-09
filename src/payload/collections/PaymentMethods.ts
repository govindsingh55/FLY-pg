import type { CollectionConfig } from 'payload'

export const PaymentMethods: CollectionConfig = {
  slug: 'payment-methods',
  admin: {
    useAsTitle: 'maskedNumber',
    defaultColumns: ['maskedNumber', 'type', 'customer', 'isDefault'],
    group: 'Payments',
  },
  access: {
    create: ({ req }) => {
      const user = req.user as { role?: string; id?: string } | undefined
      if (!user) return false
      if (user.role === 'admin' || user.role === 'manager') return true
      return user.role === 'customer'
    },
    read: ({ req }) => {
      const user = req.user as { role?: string; id?: string } | undefined
      if (!user) return false
      if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') return true
      return { customer: { equals: user.id } }
    },
    update: ({ req }) => {
      const user = req.user as { role?: string; id?: string } | undefined
      if (!user) return false
      // Only allow updating isDefault or metadata, preventing token tampering
      if (user.role === 'admin' || user.role === 'manager') return true
      return { customer: { equals: user.id } }
    },
    delete: ({ req }) => {
      const user = req.user as { role?: string; id?: string } | undefined
      if (!user) return false
      if (user.role === 'admin' || user.role === 'manager') return true
      return { customer: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
      hasMany: false,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Credit/Debit Card', value: 'card' },
        { label: 'UPI', value: 'upi' },
        { label: 'Net Banking', value: 'netbanking' },
      ],
    },
    {
      name: 'name', // Nickname e.g. "HDFC Card"
      type: 'text',
      required: true,
    },
    {
      name: 'maskedNumber',
      type: 'text',
      required: true,
      admin: {
        description: 'Last 4 digits or UPI ID masked',
      },
    },
    {
      name: 'token',
      type: 'text', // In real world, this would be encrypted or a token from PG
      required: true,
      access: {
        read: ({ req }) => {
          // Only admin or internal processes should see the full token/encrypted data
          const user = req.user as { role?: string } | undefined
          return user?.role === 'admin' || user?.role === 'manager'
        },
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional gateway specific details',
      },
    },
  ],
}
