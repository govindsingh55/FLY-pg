import type { CollectionConfig } from 'payload'

const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
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
    useAsTitle: 'email',
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
  ],
}

export default Customers
