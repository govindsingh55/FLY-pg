import type { CollectionConfig } from 'payload'

export const CustomerPaymentSettings: CollectionConfig = {
  slug: 'customer-payment-settings',
  admin: {
    useAsTitle: 'customer',
    description: 'Customer-specific payment settings and exclusions',
    group: 'Payment System',
    defaultColumns: ['customer', 'notificationsEnabled', 'excludedFromSystem', 'autoPayEnabled'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
    admin: () => true,
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      label: 'Customer',
      relationTo: 'customers',
      required: true,
      unique: true,
      admin: {
        description: 'Select the customer for these payment settings',
      },
    },
    {
      name: 'notificationsEnabled',
      type: 'checkbox',
      label: 'Enable Notifications',
      defaultValue: true,
      admin: {
        description: 'When disabled, customer will not receive any payment emails',
      },
    },
    {
      name: 'excludedFromSystem',
      type: 'checkbox',
      label: 'Exclude from Payment System',
      defaultValue: false,
      admin: {
        description: 'When enabled, customer will be excluded from all payment jobs',
        position: 'sidebar',
      },
    },
    {
      name: 'customReminderDays',
      type: 'array',
      label: 'Custom Reminder Days',
      admin: {
        description: 'Leave empty to use system defaults',
      },
      fields: [
        {
          name: 'days',
          type: 'number',
          required: true,
          min: 0,
          max: 30,
          admin: {
            description: 'Days before due date',
          },
        },
      ],
      validate: (value) => {
        if (!value || value.length === 0) {
          return true // Empty is valid (use defaults)
        }
        return true
      },
    },
    {
      name: 'autoPayEnabled',
      type: 'checkbox',
      label: 'Enable Auto-Pay',
      defaultValue: false,
      admin: {
        description: 'When enabled, customer can set up automatic payments',
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description: "Optional notes about this customer's payment settings",
      },
    },
  ],
}
