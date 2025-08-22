import type { CollectionConfig } from 'payload'

const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: [
      'id',
      'status',
      'amount',
      'customer',
      'payfor',
      'phonepeMerchantTransactionId',
      'phonepeTransactionId',
      'updatedAt',
    ],
  },
  fields: [
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
    },
    {
      name: 'payfor',
      type: 'relationship',
      relationTo: 'bookings',
      required: true,
      index: true,
    },
    {
      name: 'paymentForMonthAndYear',
      type: 'date',
      required: true,
    },
    {
      name: 'paymentDate',
      type: 'date',
    },
    {
      name: 'bookingSnapshot',
      type: 'json',
      required: true,
    },
    {
      name: 'dueDate',
      type: 'date',
      required: true,
    },
    {
      name: 'phonepeLastRaw',
      label: 'PhonePe Last Raw',
      type: 'json',
      admin: { readOnly: true },
    },
    {
      name: 'phonepeTools',
      type: 'ui',
      label: 'PhonePe Tools',
      admin: {
        components: {
          Field: '@/payload/components/PhonePeTools',
        },
      },
    },
    // PhonePe tracking fields (optional but helpful for reconciliation)
    {
      name: 'gateway',
      type: 'text',
      defaultValue: 'phonepe',
      admin: { readOnly: true },
    },
    {
      name: 'phonepeMerchantTransactionId',
      type: 'text',
      admin: { readOnly: true },
      index: true,
    },
    {
      name: 'phonepeTransactionId',
      type: 'text',
      admin: { readOnly: true },
      index: true,
    },
    {
      name: 'phonepeLastCode',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'phonepeLastState',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
}

export default Payments
