import type { AccessArgs } from 'payload'
import type { CollectionConfig } from 'payload'

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
    // Security Deposit Fields
    {
      name: 'securityDeposit',
      type: 'group',
      label: 'Security Deposit',
      admin: {
        description: 'Security deposit details for this booking',
      },
      fields: [
        {
          name: 'amount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Security deposit amount (0 if not required)',
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Not Required', value: 'not-required' },
            { label: 'Pending', value: 'pending' },
            { label: 'Paid', value: 'paid' },
            { label: 'Refunded', value: 'refunded' },
            { label: 'Partially Refunded', value: 'partially-refunded' },
            { label: 'Forfeited', value: 'forfeited' },
          ],
          defaultValue: 'not-required',
        },
        {
          name: 'paidDate',
          type: 'date',
          admin: {
            description: 'Date when security deposit was paid',
            condition: (data) => data?.securityDeposit?.status === 'paid',
          },
        },
        {
          name: 'refundedDate',
          type: 'date',
          admin: {
            description: 'Date when security deposit was refunded',
            condition: (data) =>
              data?.securityDeposit?.status === 'refunded' ||
              data?.securityDeposit?.status === 'partially-refunded',
          },
        },
        {
          name: 'refundAmount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Amount refunded (if different from original amount)',
            condition: (data) =>
              data?.securityDeposit?.status === 'refunded' ||
              data?.securityDeposit?.status === 'partially-refunded',
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          admin: {
            description: 'Additional notes about security deposit',
          },
        },
      ],
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
    },
    { name: 'roomSnapshot', type: 'json' },
    // Booking Management Extensions
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date', required: true },
    { name: 'periodInMonths', type: 'number', admin: { readOnly: true } },
    { name: 'checkInDate', type: 'date' },
    { name: 'checkOutDate', type: 'date' },
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
