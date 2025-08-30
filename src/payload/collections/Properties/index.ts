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

import { generateSlug } from './generateSlug'
import { generatePreviewPath } from '@/payload/utilities/generatePreviewPath'

// Removed FieldAccess import, use inline types below
const previewAccess = ({ req, data }: { req: any; data?: any }) => {
  const user = req.user as { role?: string; id?: string } | undefined
  // Only admins or assigned manager can preview/edit
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'manager' && data && data.manager === user.id) return true
  return false
}

const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    useAsTitle: 'name',
    preview: (doc, { req }) => {
      return `/properties/${doc.slug}`
    },
  },
  access: propertiesAccess,

  hooks: {
    beforeChange: [roomRentPriceRange],
    beforeValidate: [
      async ({ data }) => {
        if (data && !data.slug && data.name) {
          data.slug = generateSlug(data.name)
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'name', type: 'text', required: true },
            {
              name: 'slug',
              type: 'text',
              unique: true,
              required: true,
              admin: { position: 'sidebar', description: 'Auto-generated from name, editable.' },
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
              name: 'preview',
              type: 'checkbox',
              defaultValue: false,
              access: { update: previewAccess },
            },
            { name: 'description', type: 'richText' },
            {
              type: 'group',
              name: 'address',
              label: 'Address',
              fields: [
                {
                  name: 'address',
                  type: 'richText',
                  required: true,
                  admin: { description: 'The full address of the property' },
                },
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
                  admin: {
                    description: 'Useful for searching and displaying on maps',
                  },
                },
              ],
            },
            {
              name: 'propertyType',
              type: 'select',
              options: ['PG', 'Hostel', 'Apartment'],
              required: true,
            },
            {
              name: 'genderType',
              type: 'select',
              options: ['Unisex', 'Male', 'Female'],
              required: true,
            },
            {
              name: 'status',
              type: 'select',
              options: ['active', 'inactive'],
              defaultValue: 'active',
            },
            { name: 'featured', type: 'checkbox', defaultValue: false },
            {
              name: 'amenities',
              type: 'select',
              hasMany: true,
              options: [
                {
                  label: 'AC',
                  value: 'AC',
                },
                {
                  label: 'Bed Sheet',
                  value: 'Bed Sheet',
                },
                {
                  label: 'Security',
                  value: 'Security',
                },
                {
                  label: 'Pillow',
                  value: 'Pillow',
                },
                {
                  label: 'Wash',
                  value: 'Wash',
                },
                {
                  label: 'Refrigerator',
                  value: 'Refrigerator',
                },
                {
                  label: 'Power Backup',
                  value: 'Power Backup',
                },
                {
                  label: 'CCTV',
                  value: 'CCTV',
                },
                {
                  label: 'House Keeping',
                  value: 'House Keeping',
                },
                {
                  label: 'Reception',
                  value: 'Reception',
                },
                {
                  label: 'Parking',
                  value: 'Parking',
                },
                {
                  label: 'WiFi',
                  value: 'WiFi',
                },
              ],
            },
            {
              name: 'foodMenu',
              type: 'group',
              label: 'Food Menu Configuration',
              admin: {
                description: 'Configure food menu and pricing for this property',
              },
              fields: [
                {
                  name: 'menu',
                  type: 'relationship',
                  relationTo: 'food-menu',
                  required: false,
                  admin: {
                    description: 'Select the food menu for this property',
                  },
                },
                {
                  name: 'price',
                  type: 'number',
                  min: 0,
                  admin: {
                    description:
                      'Monthly food charge per person for this property (city-specific pricing)',
                    condition: (data) => data?.foodMenu?.menu,
                  },
                },
              ],
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
            // Security Deposit Configuration
            {
              name: 'securityDepositConfig',
              type: 'group',
              label: 'Security Deposit Settings',
              admin: {
                description: 'Configure security deposit requirements for this property',
              },
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: 'Enable security deposit requirement for this property',
                  },
                },
                {
                  name: 'amount',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'Default security deposit amount (can be overridden per booking)',
                    condition: (data) => data?.securityDepositConfig?.enabled,
                  },
                },
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    { label: 'Fixed Amount', value: 'fixed' },
                    { label: 'Multiple of Monthly Rent', value: 'multiplier' },
                  ],
                  defaultValue: 'fixed',
                  admin: {
                    description: 'How to calculate security deposit',
                    condition: (data) => data?.securityDepositConfig?.enabled,
                  },
                },
                {
                  name: 'multiplier',
                  type: 'number',
                  min: 0.5,
                  max: 12,
                  defaultValue: 2,
                  admin: {
                    description:
                      'Number of months rent as security deposit (if type is multiplier)',
                    condition: (data) =>
                      data?.securityDepositConfig?.enabled &&
                      data?.securityDepositConfig?.type === 'multiplier',
                  },
                },
                {
                  name: 'refundable',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Is the security deposit refundable?',
                    condition: (data) => data?.securityDepositConfig?.enabled,
                  },
                },
                {
                  name: 'refundConditions',
                  type: 'textarea',
                  admin: {
                    description: 'Conditions for security deposit refund',
                    condition: (data) =>
                      data?.securityDepositConfig?.enabled &&
                      data?.securityDepositConfig?.refundable,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Rooms',
          fields: [
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
        },
        {
          label: 'SEO',
          name: 'meta',
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: { description: 'SEO Title (Open Graph)' },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: { description: 'SEO Description (Open Graph)' },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'SEO Image (Open Graph)' },
            },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

export default Properties
