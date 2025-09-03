import type { CollectionConfig } from 'payload'

export const PaymentConfig: CollectionConfig = {
  slug: 'payment-configs',
  admin: {
    useAsTitle: 'Payment System Configuration',
    description: 'Central configuration for the payment system',
    group: 'Payment System',
    defaultColumns: ['isEnabled', 'startDate', 'monthlyPaymentDay', 'autoPayEnabled'],
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
      name: 'isEnabled',
      type: 'checkbox',
      label: 'Enable Payment System',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Master toggle to start/stop all payment jobs. When disabled, no payment jobs will run',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
      required: true,
      admin: {
        description: 'Payment system will not run before this date',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      validate: (value) => {
        if (value && new Date(value) < new Date()) {
          return 'Start date cannot be in the past'
        }
        return true
      },
    },
    {
      name: 'monthlyPaymentDay',
      type: 'number',
      label: 'Monthly Payment Day',
      required: true,
      min: 1,
      max: 31,
      defaultValue: 1,
      admin: {
        description: 'Day of month (1-31) when monthly payments are due',
      },
    },
    {
      name: 'reminderDays',
      type: 'array',
      label: 'Reminder Days',
      required: true,
      defaultValue: [7, 3, 1],
      admin: {
        description: 'Send reminders X days before payment is due',
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
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one reminder day must be specified'
        }

        const days = value.map((item: any) => item.days)
        const uniqueDays = [...new Set(days)]

        if (uniqueDays.length !== days.length) {
          return 'Reminder days must be unique'
        }

        for (const day of days) {
          if (day < 0 || day > 30) {
            return 'Reminder days must be between 0 and 30'
          }
        }

        return true
      },
    },
    {
      name: 'overdueCheckDays',
      type: 'array',
      label: 'Overdue Check Days',
      required: true,
      defaultValue: [1, 3, 7, 15, 30],
      admin: {
        description: 'Check for overdue payments X days after due date',
      },
      fields: [
        {
          name: 'days',
          type: 'number',
          required: true,
          min: 0,
          max: 90,
          admin: {
            description: 'Days after due date',
          },
        },
      ],
      validate: (value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one overdue check day must be specified'
        }

        const days = value.map((item: any) => item.days)
        const uniqueDays = [...new Set(days)]

        if (uniqueDays.length !== days.length) {
          return 'Overdue check days must be unique'
        }

        for (const day of days) {
          if (day < 0 || day > 90) {
            return 'Overdue check days must be between 0 and 30'
          }
        }

        return true
      },
    },
    {
      name: 'excludedCustomers',
      type: 'relationship',
      label: 'Excluded Customers',
      relationTo: 'customers',
      hasMany: true,
      admin: {
        description:
          'These customers will not receive payment notifications or have payments created',
      },
    },
    {
      name: 'autoPayEnabled',
      type: 'checkbox',
      label: 'Enable Auto-Pay',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'When disabled, auto-pay functionality will not work',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description: 'Optional notes for administrators',
      },
    },
  ],
}
