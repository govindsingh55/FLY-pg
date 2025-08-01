import type { CollectionConfig } from 'payload'

import { usersAccess } from '../../access/authenticated'

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: usersAccess,
    update: usersAccess,
    delete: usersAccess,
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
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

export default Users
