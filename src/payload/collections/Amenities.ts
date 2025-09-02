import type { AccessArgs } from 'payload'
import type { CollectionConfig } from 'payload'

const amenitiesAccess = {
  create: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'admin' || user?.role === 'manager'
  },
  update: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'admin' || user?.role === 'manager'
  },
  delete: ({ req }: AccessArgs) => {
    const user = req.user as { role?: string } | undefined
    return user?.role === 'admin' || user?.role === 'manager'
  },
  read: () => true,
}

const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: {
    useAsTitle: 'name',
    description: 'Manage property amenities and features',
  },
  access: amenitiesAccess,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the amenity (e.g., WiFi, Laundry, Gym)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed description of the amenity',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Icon/logo for the amenity (recommended: SVG or PNG)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image for the amenity',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Deleted', value: 'deleted' },
      ],
      defaultValue: 'active',
      required: true,
      admin: {
        description: 'Current status of the amenity',
      },
    },
    {
      name: 'iconName',
      type: 'text',
      admin: {
        description: 'Lucide React icon name for fallback (e.g., Wifi, Dumbbell)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Ensure status is not deleted when creating/updating
        if (data && data.status === 'deleted') {
          data.status = 'draft'
        }
        return data
      },
    ],
  },
}

export default Amenities
