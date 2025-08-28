import type { CollectionConfig } from 'payload'

const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
    tokenExpiration: 7200, // 2 hours
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = (args as any)?.token
        const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        // Frontend reset page route expected to handle token query param
        const resetUrl = `${appUrl.replace(/\/$/, '')}/auth/reset-password?token=${token}`
        return `<!doctype html><html><body style="font-family:Arial,sans-serif;line-height:1.5;padding:24px;color:#111">\n  <h2 style="margin-top:0">Reset your password</h2>\n  <p>We received a request to reset the password for your account. Click the button below to choose a new password.</p>\n  <p style="text-align:center;margin:32px 0">\n    <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block">Reset Password</a>\n  </p>\n  <p>If the button does not work, copy and paste this URL into your browser:</p>\n  <p style="word-break:break-all;font-size:12px;color:#555">${resetUrl}</p>\n  <hr style="margin:32px 0;border:none;border-top:1px solid #eee" />\n  <p style="font-size:12px;color:#777">If you did not request a password reset, you can ignore this email and your password will remain unchanged.</p>\n</body></html>`
      },
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'phone', 'status', 'createdAt'],
    group: 'Customer Management',
    description: 'Manage customer accounts and profiles',
  },
  access: {
    create: () => true,
    read: () => true,
    admin: () => false,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      unique: true,
      validate: (value: string | null | undefined) => {
        if (value && !/^[6-9]\d{9}$/.test(value)) {
          return 'Please enter a valid 10-digit Indian mobile number'
        }
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      defaultValue: 'active',
    },
    // Profile Management Fields
    {
      name: 'profilePicture',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile picture for the customer',
      },
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      admin: {
        description: 'Customer date of birth',
      },
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
        { label: 'Prefer not to say', value: 'prefer-not-to-say' },
      ],
    },
    {
      name: 'occupation',
      type: 'text',
      admin: {
        description: 'Customer occupation or job title',
      },
    },
    {
      name: 'company',
      type: 'text',
      admin: {
        description: 'Company or institution name',
      },
    },
    // Address Fields
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'street',
          type: 'text',
          admin: {
            description: 'Street address',
          },
        },
        {
          name: 'city',
          type: 'text',
          admin: {
            description: 'City',
          },
        },
        {
          name: 'state',
          type: 'text',
          admin: {
            description: 'State or province',
          },
        },
        {
          name: 'pincode',
          type: 'text',
          validate: (value: string | null | undefined) => {
            if (value && !/^[1-9][0-9]{5}$/.test(value)) {
              return 'Please enter a valid 6-digit Indian PIN code'
            }
            return true
          },
          admin: {
            description: 'Postal/ZIP code',
          },
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'India',
          admin: {
            description: 'Country',
          },
        },
      ],
    },
    // Emergency Contact
    {
      name: 'emergencyContact',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Emergency contact name',
          },
        },
        {
          name: 'phone',
          type: 'text',
          validate: (value: string | null | undefined) => {
            if (value && !/^[6-9]\d{9}$/.test(value)) {
              return 'Please enter a valid 10-digit Indian mobile number'
            }
            return true
          },
          admin: {
            description: 'Emergency contact phone number',
          },
        },
        {
          name: 'relationship',
          type: 'text',
          admin: {
            description: 'Relationship to customer',
          },
        },
      ],
    },
    // Notification Preferences
    {
      name: 'notificationPreferences',
      type: 'group',
      fields: [
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive email notifications',
          },
        },
        {
          name: 'smsNotifications',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive SMS notifications',
          },
        },
        {
          name: 'pushNotifications',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive push notifications',
          },
        },
        {
          name: 'bookingReminders',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive booking reminders',
          },
        },
        {
          name: 'paymentReminders',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive payment reminders',
          },
        },
        {
          name: 'maintenanceUpdates',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive maintenance updates',
          },
        },
      ],
    },
    // Auto-Pay Settings
    {
      name: 'autoPayEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Enable automatic rent payments',
      },
    },
    {
      name: 'autoPayPaymentMethod',
      type: 'text',
      admin: {
        description: 'Payment method ID for auto-pay',
        condition: (data) => data.autoPayEnabled,
      },
    },
    {
      name: 'autoPayDay',
      type: 'number',
      min: 1,
      max: 28,
      defaultValue: 1,
      admin: {
        description: 'Day of month for auto-pay (1-28)',
        condition: (data) => data.autoPayEnabled,
      },
    },
    {
      name: 'autoPayMaxAmount',
      type: 'number',
      min: 0,
      admin: {
        description: 'Maximum amount for auto-pay',
        condition: (data) => data.autoPayEnabled,
      },
    },
    {
      name: 'autoPayNotifications',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Receive notifications for auto-pay',
        condition: (data) => data.autoPayEnabled,
      },
    },
    {
      name: 'autoPayLastUpdated',
      type: 'date',
      admin: {
        description: 'Last time auto-pay settings were updated',
        readOnly: true,
      },
    },
  ],
}

export default Customers
