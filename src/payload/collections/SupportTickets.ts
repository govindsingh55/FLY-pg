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
    if (
      user.role === 'chef' ||
      user.role === 'cleaning' ||
      user.role === 'security' ||
      user.role === 'maintenance'
    ) {
      // Allow staff to update tickets where they are assigned OR where staff is null (to claim tickets)
      return {
        or: [{ staff: { equals: user.id } }, { staff: { exists: false } }],
      }
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
    if (
      user.role === 'chef' ||
      user.role === 'cleaning' ||
      user.role === 'security' ||
      user.role === 'maintenance'
    ) {
      // Allow staff to see tickets where they are assigned OR unassigned tickets matching their role
      return {
        or: [
          { staff: { equals: user.id } },
          {
            staff: { exists: false },
            type: { equals: user.role },
          },
        ],
      }
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

// Validate staff assignment matches ticket type
const validateStaffAssignment = async ({
  req,
  data,
}: {
  req: { user?: { role?: string; id?: string | number } | null | undefined }
  data?: { type?: string; staff?: string | number | null }
}) => {
  // Skip validation if no staff is being assigned
  if (!data?.staff) return { ...data }

  const user = req.user as { role?: string; id?: string | number } | null | undefined
  // Allow all changes if no user (e.g., during seeding) or if admin/manager
  if (!user || user.role === 'admin' || user.role === 'manager') return { ...data }

  // If staff is assigning themselves, validate they match the ticket type
  if (String(data.staff) === String(user.id)) {
    const ticketType = data.type
    const userRole = user.role

    // Map maintenance tickets to manager role or allow maintenance role
    if (ticketType === 'maintenance' && userRole !== 'manager' && userRole !== 'maintenance') {
      throw new Error('Only managers or maintenance staff can be assigned to maintenance tickets.')
    }

    // For other types, role must match type
    if (ticketType !== 'maintenance' && ticketType !== userRole) {
      throw new Error(`Only ${ticketType} staff can be assigned to ${ticketType} tickets.`)
    }
  }

  return { ...data }
}

const SupportTickets: CollectionConfig = {
  slug: 'support-tickets',
  admin: { useAsTitle: 'id' },
  // @ts-expect-error - Complex or queries in access control don't match Payload's strict Where types
  access: supportTicketsAccess,
  hooks: {
    beforeChange: [preventUnauthorizedClose, validateStaffAssignment],
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true },
    { name: 'property', type: 'relationship', relationTo: 'properties', required: false },
    { name: 'staff', type: 'relationship', relationTo: 'users' },
    {
      name: 'type',
      label: 'Support Required For',
      type: 'select',
      options: [
        { label: 'Management', value: 'manager' },
        { label: 'Chef (Food)', value: 'chef' },
        { label: 'Cleaning', value: 'cleaning' },
        { label: 'Maintenance', value: 'maintenance' },
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
        {
          name: 'updatedBy',
          type: 'relationship',
          relationTo: ['users', 'customers'],
          required: true,
        },
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
        {
          name: 'sender',
          type: 'relationship',
          relationTo: ['users', 'customers'],
          required: true,
        },
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
