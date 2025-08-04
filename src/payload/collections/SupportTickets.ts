import type { AccessArgs } from 'payload'

const supportTicketsAccess = {
  create: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'customer' || user?.role === 'admin' || user?.role === 'manager'
  },
  update: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string; id?: string | number } | undefined
    if (!user) return false
    if (user.role === 'manager' || user.role === 'admin') return true
    if (user.role === 'chef' || user.role === 'cleaning' || user.role === 'security') {
      return Object.assign({}, { staff: { equals: user.id } })
    }
    if (user.role === 'customer') {
      return Object.assign({}, { customer: { equals: user.id } })
    }
    return false
  },
  delete: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'admin' || user?.role === 'manager'
  },
  read: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string; id?: string | number } | undefined
    if (!user) return false
    if (user.role === 'manager' || user.role === 'admin') return true
    if (user.role === 'chef' || user.role === 'cleaning' || user.role === 'security') {
      return Object.assign({}, { staff: { equals: user.id } })
    }
    if (user.role === 'customer') {
      return Object.assign({}, { customer: { equals: user.id } })
    }
    return false
  },
}

import type { CollectionConfig } from 'payload'

// Only allow manager or the customer to close a ticket
const preventUnauthorizedClose = async ({
  req,
  data,
  originalDoc,
}: {
  req: { user?: { role?: string; id?: string | number } | null | undefined }
  data?: { status?: string }
  originalDoc?: { customer?: string | number }
}) => {
  if (!data?.status || data.status !== 'closed') return { ...data }
  const user = req.user as { role?: string; id?: string | number } | null | undefined
  // Allow all changes if no user (e.g., during seeding)
  if (!user) return { ...data }
  // Allow if manager
  if (user.role === 'manager') return { ...data }
  // Allow if customer and is the ticket owner
  if (
    user.role === 'customer' &&
    originalDoc &&
    originalDoc.customer &&
    String(originalDoc.customer) === String(user.id)
  ) {
    return { ...data }
  }
  throw new Error('Only a manager or the ticket owner can close this support ticket.')
}

const SupportTickets: CollectionConfig = {
  slug: 'support-tickets',
  admin: { useAsTitle: 'id' },
  access: supportTicketsAccess,
  hooks: {
    beforeChange: [preventUnauthorizedClose],
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true },
    { name: 'staff', type: 'relationship', relationTo: 'users' },
    {
      name: 'type',
      label: 'Support Required For',
      type: 'select',
      options: [
        { label: 'Management', value: 'manager' },
        { label: 'Chef (Food)', value: 'chef' },
        { label: 'Cleaning', value: 'cleaning' },
        { label: 'Maintenance', value: 'manager' },
        { label: 'Security', value: 'security' },
      ],
      required: true,
    },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
      defaultValue: 'open',
      required: true,
    },
    {
      // Uncommented progress field for debugging
      name: 'progress',
      type: 'array',
      label: 'Status Progress',
      fields: [
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Open', value: 'open' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Closed', value: 'closed' },
          ],
          required: true,
        },
        { name: 'updatedBy', type: 'relationship', relationTo: 'users', required: true },
        { name: 'note', type: 'textarea' },
        { name: 'updatedAt', type: 'date', required: true },
      ],
    },
    {
      // Uncommented conversation field for debugging
      name: 'conversation',
      label: 'Chat/Conversation',
      type: 'array',
      fields: [
        { name: 'sender', type: 'relationship', relationTo: 'users', required: true },
        { name: 'message', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'support-media' },
        { name: 'createdAt', type: 'date', required: true },
      ],
    },
    { name: 'createdAt', type: 'date', required: true },
    { name: 'updatedAt', type: 'date' },
  ],
}

export default SupportTickets
