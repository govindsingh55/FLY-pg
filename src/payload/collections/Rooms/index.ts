import type { AccessArgs } from 'payload'

const roomsAccess = {
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
import type { CollectionConfig } from 'payload'

const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: { useAsTitle: 'name' },
  access: roomsAccess,
  fields: [
    { name: 'name', label: 'Room name', type: 'text', required: true },
    {
      name: 'roomType',
      type: 'select',
      options: [
        { label: 'Single', value: 'single' },
        { label: 'Two Sharing', value: 'two_sharing' },
        { label: 'Three Sharing', value: 'three_sharing' },
      ],
      required: true,
    },
    { name: 'rent', type: 'number', required: true },
    {
      name: 'amenities',
      type: 'array',
      fields: [
        {
          name: 'amenity',
          type: 'select',
          options: [
            'AC',
            'Bed Sheet',
            'Security',
            'Pillow',
            'Wash',
            'Refrigerator',
            'Power Backup',
            'CCTV',
            'House Keeping',
            'Reception',
            'Drinking Water',
            'Almira',
            'Bathroom',
          ],
        },
      ],
    },
    { name: 'description', type: 'richText' },
    { name: 'status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' },
    { name: 'available', type: 'checkbox', defaultValue: true },
    {
      name: 'images',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: false },
        { name: 'isCover', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}

export default Rooms
