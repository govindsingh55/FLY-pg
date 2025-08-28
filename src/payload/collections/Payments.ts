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
      'merchantOrderId',
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
        { label: 'Initiated', value: 'initiated' },
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Partially Refunded', value: 'partially-refunded' },
      ],
      required: true,
      index: true,
      admin: {
        description: 'Current status of the payment',
      },
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
      name: 'merchantOrderId',
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
    // Payment Management Extensions
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        { label: 'Credit Card', value: 'credit-card' },
        { label: 'Debit Card', value: 'debit-card' },
        { label: 'UPI', value: 'upi' },
        { label: 'Net Banking', value: 'net-banking' },
        { label: 'Wallet', value: 'wallet' },
        { label: 'Cash', value: 'cash' },
      ],
      defaultValue: 'upi',
    },
    {
      name: 'autoPayEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Enable automatic payment for future months',
      },
    },
    {
      name: 'lateFees',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Late fees applied to this payment',
      },
    },
    {
      name: 'utilityCharges',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Utility charges included in this payment',
      },
    },
    {
      name: 'paymentReceipt',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Payment receipt document',
      },
    },
    {
      name: 'paymentMethodDetails',
      type: 'group',
      fields: [
        {
          name: 'cardLast4',
          type: 'text',
          admin: {
            description: 'Last 4 digits of card (if applicable)',
          },
        },
        {
          name: 'cardType',
          type: 'text',
          admin: {
            description: 'Type of card (Visa, MasterCard, etc.)',
          },
        },
        {
          name: 'upiId',
          type: 'text',
          admin: {
            description: 'UPI ID used for payment',
          },
        },
        {
          name: 'bankName',
          type: 'text',
          admin: {
            description: 'Bank name for net banking',
          },
        },
      ],
    },
    {
      name: 'reminderSettings',
      type: 'group',
      fields: [
        {
          name: 'sendReminders',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Send payment reminders',
          },
        },
        {
          name: 'reminderDays',
          type: 'number',
          min: 1,
          max: 30,
          defaultValue: 7,
          admin: {
            description: 'Days before due date to send reminder',
          },
        },
        {
          name: 'reminderSentAt',
          type: 'date',
          admin: {
            description: 'When the last reminder was sent',
          },
        },
      ],
    },
    // Additional Fields
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes about this payment',
      },
    },
    {
      name: 'processedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Admin user who processed this payment',
      },
    },
    // Payment Analytics Fields
    {
      name: 'processingTime',
      type: 'number',
      admin: {
        description: 'Time taken to process payment (in seconds)',
        readOnly: true,
      },
    },
    {
      name: 'retryCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of times payment was retried',
      },
    },
    {
      name: 'lastRetryAt',
      type: 'date',
      admin: {
        description: 'Last time payment was retried',
      },
    },
    {
      name: 'customerSatisfactionScore',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        description: 'Customer satisfaction rating for payment experience',
      },
    },
    {
      name: 'paymentSource',
      type: 'select',
      options: [
        { label: 'Web Dashboard', value: 'web-dashboard' },
        { label: 'Mobile App', value: 'mobile-app' },
        { label: 'Admin Panel', value: 'admin-panel' },
        { label: 'Auto-Pay', value: 'auto-pay' },
        { label: 'Phone Call', value: 'phone-call' },
        { label: 'Walk-in', value: 'walk-in' },
      ],
      defaultValue: 'web-dashboard',
      admin: {
        description: 'Source through which payment was initiated',
      },
    },
    {
      name: 'deviceInfo',
      type: 'group',
      fields: [
        {
          name: 'userAgent',
          type: 'text',
          admin: {
            description: 'User agent string',
          },
        },
        {
          name: 'ipAddress',
          type: 'text',
          admin: {
            description: 'IP address of payment initiator',
          },
        },
        {
          name: 'deviceType',
          type: 'select',
          options: [
            { label: 'Desktop', value: 'desktop' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Tablet', value: 'tablet' },
            { label: 'Unknown', value: 'unknown' },
          ],
          admin: {
            description: 'Type of device used for payment',
          },
        },
      ],
    },
  ],
}

export default Payments
