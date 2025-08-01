import type { AccessArgs } from 'payload'
import type { CollectionConfig } from 'payload'
import roomRentPriceRange from './hooks/roomRentPriceRange'

const propertiesAccess = {
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

const Properties: CollectionConfig = {
  slug: 'properties',
  admin: { useAsTitle: 'name' },
  access: propertiesAccess,
  hooks: {
    afterChange: [roomRentPriceRange],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'address', type: 'richText', required: true },
    {
      name: 'location',
      type: 'group',
      fields: [
        { name: 'state', type: 'text', required: true },
        { name: 'city', type: 'text', required: true },
        { name: 'sector', type: 'text', required: false },
        { name: 'coordinates', type: 'point', required: true },
        { name: 'mapLink', type: 'text', required: true },
      ],
    },
    { name: 'description', type: 'richText' },
    {
      name: 'propertyType',
      type: 'select',
      options: ['PG', 'Hostel', 'Apartment'],
      required: true,
    },
    { name: 'genderType', type: 'select', options: ['Unisex', 'Male', 'Female'], required: true },
    { name: 'status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
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
            'Almirah',
            'Bathroom',
          ],
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: false },
        { name: 'isCover', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'foodMenu',
      type: 'relationship',
      relationTo: 'food-menu',
      required: false,
    },
    {
      name: 'nearbyLocations',
      type: 'array',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'distance', type: 'text' },
      ],
    },
    { name: 'manager', type: 'relationship', relationTo: 'users', required: true },
    { name: 'relatedProperties', type: 'relationship', relationTo: 'properties', hasMany: true },
    { name: 'rooms', type: 'relationship', relationTo: 'rooms', hasMany: true },
    {
      name: 'roomRentPriceRange',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        { name: 'min', type: 'number' },
        { name: 'max', type: 'number' },
      ],
    },
  ],
}

export default Properties
