import type { CollectionConfig } from 'payload'

const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'customer', 'type', 'isRead', 'createdAt'],
    group: 'Customer Management',
    description: 'Manage customer notifications and alerts',
  },
  access: {
    create: ({ req }) => {
      const user = req.user as { role?: string } | undefined
      return user?.role === 'admin' || user?.role === 'manager'
    },
    read: ({ req }) => {
      const user = req.user as { role?: string; id?: string | number } | undefined
      if (!user) return false
      if (user.role === 'admin' || user.role === 'manager') return true
      if (user.role === 'customer') {
        return { customer: { equals: user.id } }
      }
      return false
    },
    update: ({ req }) => {
      const user = req.user as { role?: string; id?: string | number } | undefined
      if (!user) return false
      if (user.role === 'admin' || user.role === 'manager') return true
      if (user.role === 'customer') {
        return { customer: { equals: user.id } }
      }
      return false
    },
    delete: ({ req }) => {
      const user = req.user as { role?: string } | undefined
      return user?.role === 'admin' || user?.role === 'manager'
    },
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: {
        description: 'The customer who will receive this notification',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Notification title or subject',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Notification message content',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Booking', value: 'booking' },
        { label: 'Payment', value: 'payment' },
        { label: 'Support', value: 'support' },
        { label: 'General', value: 'general' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Security', value: 'security' },
        { label: 'Food', value: 'food' },
        { label: 'Cleaning', value: 'cleaning' },
      ],
      defaultValue: 'general',
      admin: {
        description: 'Type of notification',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Booking Updates', value: 'booking' },
        { label: 'Payment Reminders', value: 'payment' },
        { label: 'Support Tickets', value: 'support' },
        { label: 'System Alerts', value: 'system' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Security', value: 'security' },
        { label: 'Food Services', value: 'food' },
        { label: 'Cleaning Services', value: 'cleaning' },
      ],
      defaultValue: 'all',
      admin: {
        description: 'Category for filtering notifications',
      },
    },
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
      admin: {
        description: 'Priority level of the notification',
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the customer has read this notification',
      },
    },
    {
      name: 'readAt',
      type: 'date',
      admin: {
        description: 'When the notification was read',
        readOnly: true,
      },
    },
    {
      name: 'actionUrl',
      type: 'text',
      admin: {
        description: 'Optional URL for notification action (e.g., link to booking details)',
      },
    },
    {
      name: 'actionText',
      type: 'text',
      admin: {
        description: 'Text for the action button (e.g., "View Booking", "Pay Now")',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'When the notification expires (optional)',
      },
    },
    {
      name: 'relatedBooking',
      type: 'relationship',
      relationTo: 'bookings',
      admin: {
        description: 'Related booking (if this notification is about a booking)',
      },
    },
    {
      name: 'relatedPayment',
      type: 'relationship',
      relationTo: 'payments',
      admin: {
        description: 'Related payment (if this notification is about a payment)',
      },
    },
    {
      name: 'relatedSupportTicket',
      type: 'relationship',
      relationTo: 'support-tickets',
      admin: {
        description: 'Related support ticket (if this notification is about support)',
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
        description: 'When the notification was created',
      },
    },
    {
      name: 'updatedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When the notification was last updated',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Set createdAt if not provided
        if (!data.createdAt) {
          data.createdAt = new Date().toISOString()
        }

        // Set readAt when isRead is set to true
        if (data.isRead && !data.readAt) {
          data.readAt = new Date().toISOString()
        }

        // Clear readAt when isRead is set to false
        if (data.isRead === false) {
          data.readAt = undefined
        }

        return data
      },
    ],
  },
}

export default Notifications
