import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'Chef', value: 'chef' },
        { label: 'Cleaning', value: 'cleaning' },
        { label: 'Security', value: 'security' },
      ],
      defaultValue: 'manager',
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: false,
      hasMany: true,
      admin: {
        description: 'Select the properties this user is associated with.',
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
  ],
}
