import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    preview: (doc) => {
      if (doc.status === 'published') {
        return `/${doc.slug}`
      }
      return `/preview?slug=${doc.slug}&type=draft&secret=${process.env.PREVIEW_SECRET}`
    },
  },
  access: {
    create: authenticated,
    read: anyone,
    update: authenticated,
    delete: authenticated,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Page Title',
              required: true,
              admin: {
                description: 'The main title of the page',
              },
            },
            {
              name: 'slug',
              type: 'text',
              label: 'URL Slug',
              required: true,
              unique: true,
              admin: {
                description: 'The URL path for this page (e.g., "about-us")',
              },
              hooks: {
                beforeValidate: [
                  ({ value, operation }) => {
                    if (operation === 'create' && value) {
                      // Check against protected routes
                      const protectedRoutes = [
                        'dashboard',
                        'auth',
                        'admin',
                        'properties',
                        'payments',
                        'api',
                        'test-single-property',
                      ]
                      if (protectedRoutes.includes(value)) {
                        throw new Error(`Slug "${value}" is reserved and cannot be used`)
                      }
                    }
                    return value
                  },
                ],
              },
            },
            {
              name: 'status',
              type: 'select',
              label: 'Status',
              required: true,
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
              ],
              defaultValue: 'draft',
            },
            {
              name: 'theme',
              type: 'group',
              label: 'Theme Settings',
              fields: [
                {
                  name: 'colorScheme',
                  type: 'select',
                  label: 'Color Scheme',
                  options: [
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                    { label: 'Auto', value: 'auto' },
                  ],
                  defaultValue: 'auto',
                },
                {
                  name: 'backgroundVariant',
                  type: 'select',
                  label: 'Background Variant',
                  options: [
                    { label: 'Default', value: 'default' },
                    { label: 'Gradient', value: 'gradient' },
                    { label: 'Pattern', value: 'pattern' },
                  ],
                  defaultValue: 'default',
                },
              ],
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Page Layout',
              blocks: [
                {
                  slug: 'hero',
                  labels: {
                    singular: 'Hero Section',
                    plural: 'Hero Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Hero Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Hero Subtitle',
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      label: 'Hero Description',
                    },
                    {
                      name: 'backgroundImage',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Background Image',
                    },
                    {
                      name: 'ctaButton',
                      type: 'group',
                      label: 'Call to Action Button',
                      fields: [
                        {
                          name: 'text',
                          type: 'text',
                          label: 'Button Text',
                        },
                        {
                          name: 'url',
                          type: 'text',
                          label: 'Button URL',
                        },
                      ],
                    },
                    // Enhanced styling options
                    {
                      name: 'backgroundColor',
                      type: 'select',
                      label: 'Background Color',
                      options: [
                        { label: 'Transparent', value: 'transparent' },
                        { label: 'Background', value: 'background' },
                        { label: 'Muted', value: 'muted' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                      defaultValue: 'transparent',
                    },
                    {
                      name: 'textAlignment',
                      type: 'select',
                      label: 'Text Alignment',
                      options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                      ],
                      defaultValue: 'center',
                    },
                    {
                      name: 'padding',
                      type: 'select',
                      label: 'Section Padding',
                      options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Default', value: 'default' },
                        { label: 'Large', value: 'large' },
                        { label: 'Extra Large', value: 'xl' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'maxWidth',
                      type: 'select',
                      label: 'Max Width',
                      options: [
                        { label: 'Narrow', value: 'narrow' },
                        { label: 'Default', value: 'default' },
                        { label: 'Wide', value: 'wide' },
                        { label: 'Full', value: 'full' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'overlayOpacity',
                      type: 'select',
                      label: 'Overlay Opacity',
                      options: [
                        { label: 'Light (20%)', value: 'light' },
                        { label: 'Medium (40%)', value: 'medium' },
                        { label: 'Dark (60%)', value: 'dark' },
                        { label: 'Heavy (80%)', value: 'heavy' },
                      ],
                      defaultValue: 'medium',
                    },
                  ],
                },
                {
                  slug: 'features',
                  labels: {
                    singular: 'Features Section',
                    plural: 'Features Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'features',
                      type: 'array',
                      label: 'Features',
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                          label: 'Feature Title',
                          required: true,
                        },
                        {
                          name: 'description',
                          type: 'textarea',
                          label: 'Feature Description',
                        },
                        {
                          name: 'icon',
                          type: 'upload',
                          relationTo: 'media',
                          label: 'Feature Icon',
                        },
                      ],
                    },
                    // Enhanced styling options
                    {
                      name: 'backgroundColor',
                      type: 'select',
                      label: 'Background Color',
                      options: [
                        { label: 'Transparent', value: 'transparent' },
                        { label: 'Background', value: 'background' },
                        { label: 'Muted', value: 'muted' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                      defaultValue: 'transparent',
                    },
                    {
                      name: 'textAlignment',
                      type: 'select',
                      label: 'Text Alignment',
                      options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                      ],
                      defaultValue: 'center',
                    },
                    {
                      name: 'padding',
                      type: 'select',
                      label: 'Section Padding',
                      options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Default', value: 'default' },
                        { label: 'Large', value: 'large' },
                        { label: 'Extra Large', value: 'xl' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'maxWidth',
                      type: 'select',
                      label: 'Max Width',
                      options: [
                        { label: 'Narrow', value: 'narrow' },
                        { label: 'Default', value: 'default' },
                        { label: 'Wide', value: 'wide' },
                        { label: 'Full', value: 'full' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'showBorder',
                      type: 'checkbox',
                      label: 'Show Border',
                      defaultValue: false,
                    },
                  ],
                },
                {
                  slug: 'content',
                  labels: {
                    singular: 'Content Section',
                    plural: 'Content Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'content',
                      type: 'richText',
                      label: 'Content',
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Content Image',
                    },
                    {
                      name: 'variant',
                      type: 'select',
                      label: 'Content Width',
                      options: [
                        { label: 'Default (4xl)', value: 'default' },
                        { label: 'Narrow (2xl)', value: 'narrow' },
                        { label: 'Wide (6xl)', value: 'wide' },
                        { label: 'Centered (4xl)', value: 'centered' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'backgroundColor',
                      type: 'select',
                      label: 'Background Color',
                      options: [
                        { label: 'Transparent', value: 'transparent' },
                        { label: 'Background', value: 'background' },
                        { label: 'Muted', value: 'muted' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                      defaultValue: 'transparent',
                    },
                    {
                      name: 'textAlignment',
                      type: 'select',
                      label: 'Text Alignment',
                      options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                      ],
                      defaultValue: 'center',
                    },
                    {
                      name: 'showBorder',
                      type: 'checkbox',
                      label: 'Show Border',
                      defaultValue: false,
                    },
                    {
                      name: 'padding',
                      type: 'select',
                      label: 'Section Padding',
                      options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Default', value: 'default' },
                        { label: 'Large', value: 'large' },
                        { label: 'Extra Large', value: 'xl' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'imagePosition',
                      type: 'select',
                      label: 'Image Position',
                      options: [
                        { label: 'Right', value: 'right' },
                        { label: 'Left', value: 'left' },
                        { label: 'Top', value: 'top' },
                        { label: 'Bottom', value: 'bottom' },
                      ],
                      defaultValue: 'right',
                    },
                    {
                      name: 'imageSize',
                      type: 'select',
                      label: 'Image Size',
                      options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' },
                        { label: 'Full Width', value: 'full' },
                      ],
                      defaultValue: 'medium',
                    },
                  ],
                },
                {
                  slug: 'contact',
                  labels: {
                    singular: 'Contact Section',
                    plural: 'Contact Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      label: 'Description',
                    },
                    {
                      name: 'email',
                      type: 'email',
                      label: 'Contact Email',
                    },
                    {
                      name: 'phone',
                      type: 'text',
                      label: 'Contact Phone',
                    },
                    {
                      name: 'address',
                      type: 'textarea',
                      label: 'Address',
                    },
                    // Enhanced styling options
                    {
                      name: 'backgroundColor',
                      type: 'select',
                      label: 'Background Color',
                      options: [
                        { label: 'Transparent', value: 'transparent' },
                        { label: 'Background', value: 'background' },
                        { label: 'Muted', value: 'muted' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                      defaultValue: 'transparent',
                    },
                    {
                      name: 'textAlignment',
                      type: 'select',
                      label: 'Text Alignment',
                      options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                      ],
                      defaultValue: 'center',
                    },
                    {
                      name: 'padding',
                      type: 'select',
                      label: 'Section Padding',
                      options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Default', value: 'default' },
                        { label: 'Large', value: 'large' },
                        { label: 'Extra Large', value: 'xl' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'maxWidth',
                      type: 'select',
                      label: 'Max Width',
                      options: [
                        { label: 'Narrow', value: 'narrow' },
                        { label: 'Default', value: 'default' },
                        { label: 'Wide', value: 'wide' },
                        { label: 'Full', value: 'full' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'showBorder',
                      type: 'checkbox',
                      label: 'Show Border',
                      defaultValue: false,
                    },
                  ],
                },
                {
                  slug: 'stats',
                  labels: {
                    singular: 'Stats Section',
                    plural: 'Stats Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'stats',
                      type: 'array',
                      label: 'Statistics',
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          label: 'Stat Label',
                          required: true,
                        },
                        {
                          name: 'value',
                          type: 'text',
                          label: 'Stat Value',
                          required: true,
                        },
                      ],
                    },
                    // Enhanced styling options
                    {
                      name: 'backgroundColor',
                      type: 'select',
                      label: 'Background Color',
                      options: [
                        { label: 'Transparent', value: 'transparent' },
                        { label: 'Background', value: 'background' },
                        { label: 'Muted', value: 'muted' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                      defaultValue: 'transparent',
                    },
                    {
                      name: 'textAlignment',
                      type: 'select',
                      label: 'Text Alignment',
                      options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                      ],
                      defaultValue: 'center',
                    },
                    {
                      name: 'padding',
                      type: 'select',
                      label: 'Section Padding',
                      options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Default', value: 'default' },
                        { label: 'Large', value: 'large' },
                        { label: 'Extra Large', value: 'xl' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'maxWidth',
                      type: 'select',
                      label: 'Max Width',
                      options: [
                        { label: 'Narrow', value: 'narrow' },
                        { label: 'Default', value: 'default' },
                        { label: 'Wide', value: 'wide' },
                        { label: 'Full', value: 'full' },
                      ],
                      defaultValue: 'default',
                    },
                  ],
                },
                {
                  slug: 'media',
                  labels: {
                    singular: 'Media Section',
                    plural: 'Media Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                    },
                    {
                      name: 'media',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Media File',
                      required: true,
                    },
                    {
                      name: 'caption',
                      type: 'text',
                      label: 'Media Caption',
                    },
                  ],
                },
                {
                  slug: 'testimonials',
                  labels: {
                    singular: 'Testimonials Section',
                    plural: 'Testimonials Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'testimonials',
                      type: 'array',
                      label: 'Testimonials',
                      fields: [
                        {
                          name: 'name',
                          type: 'text',
                          label: 'Customer Name',
                          required: true,
                        },
                        {
                          name: 'role',
                          type: 'text',
                          label: 'Customer Role/Title',
                        },
                        {
                          name: 'text',
                          type: 'textarea',
                          label: 'Testimonial Text',
                          required: true,
                        },
                        {
                          name: 'avatar',
                          type: 'upload',
                          relationTo: 'media',
                          label: 'Customer Avatar',
                        },
                        {
                          name: 'tag',
                          type: 'text',
                          label: 'Tag/Badge',
                        },
                        {
                          name: 'rating',
                          type: 'number',
                          label: 'Rating (1-5)',
                          min: 1,
                          max: 5,
                        },
                      ],
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      label: 'Layout Style',
                      options: [
                        { label: 'Grid', value: 'grid' },
                        { label: 'Carousel', value: 'carousel' },
                        { label: 'Wall', value: 'wall' },
                      ],
                      defaultValue: 'grid',
                    },
                  ],
                },
                {
                  slug: 'gallery',
                  labels: {
                    singular: 'Gallery Section',
                    plural: 'Gallery Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'images',
                      type: 'array',
                      label: 'Gallery Images',
                      fields: [
                        {
                          name: 'image',
                          type: 'upload',
                          relationTo: 'media',
                          label: 'Image',
                          required: true,
                        },
                        {
                          name: 'title',
                          type: 'text',
                          label: 'Image Title',
                        },
                        {
                          name: 'caption',
                          type: 'text',
                          label: 'Image Caption',
                        },
                        {
                          name: 'badge',
                          type: 'text',
                          label: 'Badge Text',
                        },
                      ],
                    },
                    {
                      name: 'columns',
                      type: 'select',
                      label: 'Grid Columns',
                      options: [
                        { label: '2 Columns', value: '2' },
                        { label: '3 Columns', value: '3' },
                        { label: '4 Columns', value: '4' },
                        { label: '5 Columns', value: '5' },
                      ],
                      defaultValue: '4',
                    },
                  ],
                },
                {
                  slug: 'press',
                  labels: {
                    singular: 'Press/Logos Section',
                    plural: 'Press/Logos Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'logos',
                      type: 'array',
                      label: 'Press/Partner Logos',
                      fields: [
                        {
                          name: 'name',
                          type: 'text',
                          label: 'Company Name',
                          required: true,
                        },
                        {
                          name: 'logo',
                          type: 'upload',
                          relationTo: 'media',
                          label: 'Logo Image',
                          required: true,
                        },
                        {
                          name: 'url',
                          type: 'text',
                          label: 'Company Website URL',
                        },
                      ],
                    },
                    {
                      name: 'style',
                      type: 'select',
                      label: 'Logo Style',
                      options: [
                        { label: 'Grayscale', value: 'grayscale' },
                        { label: 'Color', value: 'color' },
                        { label: 'Monochrome', value: 'monochrome' },
                      ],
                      defaultValue: 'grayscale',
                    },
                  ],
                },
                {
                  slug: 'amenities',
                  labels: {
                    singular: 'Amenities Section',
                    plural: 'Amenities Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'amenities',
                      type: 'array',
                      label: 'Amenities',
                      fields: [
                        {
                          name: 'name',
                          type: 'text',
                          label: 'Amenity Name',
                          required: true,
                        },
                        {
                          name: 'icon',
                          type: 'upload',
                          relationTo: 'media',
                          label: 'Amenity Icon',
                        },
                        {
                          name: 'description',
                          type: 'text',
                          label: 'Description',
                        },
                      ],
                    },
                    {
                      name: 'columns',
                      type: 'select',
                      label: 'Grid Columns',
                      options: [
                        { label: '2 Columns', value: '2' },
                        { label: '3 Columns', value: '3' },
                        { label: '4 Columns', value: '4' },
                        { label: '5 Columns', value: '5' },
                      ],
                      defaultValue: '4',
                    },
                  ],
                },
                {
                  slug: 'locations',
                  labels: {
                    singular: 'Nearby Locations Section',
                    plural: 'Nearby Locations Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'locations',
                      type: 'array',
                      label: 'Nearby Locations',
                      fields: [
                        {
                          name: 'name',
                          type: 'text',
                          label: 'Location Name',
                          required: true,
                        },
                        {
                          name: 'distance',
                          type: 'text',
                          label: 'Distance',
                          required: true,
                        },
                        {
                          name: 'icon',
                          type: 'upload',
                          relationTo: 'media',
                          label: 'Location Icon',
                        },
                        {
                          name: 'description',
                          type: 'text',
                          label: 'Description',
                        },
                      ],
                    },
                  ],
                },
                {
                  slug: 'pricing',
                  labels: {
                    singular: 'Pricing Section',
                    plural: 'Pricing Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'plans',
                      type: 'array',
                      label: 'Pricing Plans',
                      fields: [
                        {
                          name: 'name',
                          type: 'text',
                          label: 'Plan Name',
                          required: true,
                        },
                        {
                          name: 'price',
                          type: 'text',
                          label: 'Price',
                          required: true,
                        },
                        {
                          name: 'period',
                          type: 'text',
                          label: 'Period (e.g., /month)',
                        },
                        {
                          name: 'description',
                          type: 'textarea',
                          label: 'Plan Description',
                        },
                        {
                          name: 'features',
                          type: 'array',
                          label: 'Plan Features',
                          fields: [
                            {
                              name: 'feature',
                              type: 'text',
                              label: 'Feature',
                              required: true,
                            },
                            {
                              name: 'included',
                              type: 'checkbox',
                              label: 'Included',
                              defaultValue: true,
                            },
                          ],
                        },
                        {
                          name: 'ctaText',
                          type: 'text',
                          label: 'CTA Button Text',
                        },
                        {
                          name: 'ctaUrl',
                          type: 'text',
                          label: 'CTA Button URL',
                        },
                        {
                          name: 'highlighted',
                          type: 'checkbox',
                          label: 'Highlighted Plan',
                          defaultValue: false,
                        },
                      ],
                    },
                  ],
                },
                {
                  slug: 'faq',
                  labels: {
                    singular: 'FAQ Section',
                    plural: 'FAQ Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'faqs',
                      type: 'array',
                      label: 'FAQ Items',
                      fields: [
                        {
                          name: 'question',
                          type: 'text',
                          label: 'Question',
                          required: true,
                        },
                        {
                          name: 'answer',
                          type: 'richText',
                          label: 'Answer',
                          required: true,
                        },
                      ],
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      label: 'Layout Style',
                      options: [
                        { label: 'Accordion', value: 'accordion' },
                        { label: 'Grid', value: 'grid' },
                        { label: 'List', value: 'list' },
                      ],
                      defaultValue: 'accordion',
                    },
                  ],
                },
                {
                  slug: 'team',
                  labels: {
                    singular: 'Team Section',
                    plural: 'Team Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'members',
                      type: 'array',
                      label: 'Team Members',
                      fields: [
                        {
                          name: 'name',
                          type: 'text',
                          label: 'Member Name',
                          required: true,
                        },
                        {
                          name: 'role',
                          type: 'text',
                          label: 'Role/Title',
                          required: true,
                        },
                        {
                          name: 'bio',
                          type: 'textarea',
                          label: 'Bio',
                        },
                        {
                          name: 'photo',
                          type: 'upload',
                          relationTo: 'media',
                          label: 'Photo',
                        },
                        {
                          name: 'socialLinks',
                          type: 'array',
                          label: 'Social Links',
                          fields: [
                            {
                              name: 'platform',
                              type: 'select',
                              label: 'Platform',
                              options: [
                                { label: 'LinkedIn', value: 'linkedin' },
                                { label: 'Twitter', value: 'twitter' },
                                { label: 'Instagram', value: 'instagram' },
                                { label: 'Facebook', value: 'facebook' },
                                { label: 'Email', value: 'email' },
                              ],
                            },
                            {
                              name: 'url',
                              type: 'text',
                              label: 'URL',
                              required: true,
                            },
                            {
                              name: 'label',
                              type: 'text',
                              label: 'Display Label',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'columns',
                      type: 'select',
                      label: 'Grid Columns',
                      options: [
                        { label: '2 Columns', value: '2' },
                        { label: '3 Columns', value: '3' },
                        { label: '4 Columns', value: '4' },
                      ],
                      defaultValue: '3',
                    },
                  ],
                },
                {
                  slug: 'blog',
                  labels: {
                    singular: 'Blog/News Section',
                    plural: 'Blog/News Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'posts',
                      type: 'array',
                      label: 'Blog Posts',
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                          label: 'Post Title',
                          required: true,
                        },
                        {
                          name: 'excerpt',
                          type: 'textarea',
                          label: 'Post Excerpt',
                        },
                        {
                          name: 'featuredImage',
                          type: 'upload',
                          relationTo: 'media',
                          label: 'Featured Image',
                        },
                        {
                          name: 'author',
                          type: 'text',
                          label: 'Author Name',
                        },
                        {
                          name: 'date',
                          type: 'date',
                          label: 'Publish Date',
                        },
                        {
                          name: 'url',
                          type: 'text',
                          label: 'Post URL',
                        },
                        {
                          name: 'category',
                          type: 'text',
                          label: 'Category',
                        },
                        {
                          name: 'tags',
                          type: 'array',
                          label: 'Tags',
                          fields: [
                            {
                              name: 'tag',
                              type: 'text',
                              label: 'Tag',
                              required: true,
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      label: 'Layout Style',
                      options: [
                        { label: 'Grid', value: 'grid' },
                        { label: 'List', value: 'list' },
                        { label: 'Carousel', value: 'carousel' },
                      ],
                      defaultValue: 'grid',
                    },
                    {
                      name: 'showViewAll',
                      type: 'checkbox',
                      label: 'Show "View All" Button',
                      defaultValue: true,
                    },
                    {
                      name: 'viewAllUrl',
                      type: 'text',
                      label: 'View All URL',
                    },
                  ],
                },
                {
                  slug: 'video',
                  labels: {
                    singular: 'Video Section',
                    plural: 'Video Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'video',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Video File',
                    },
                    {
                      name: 'videoUrl',
                      type: 'text',
                      label: 'Video URL (YouTube, Vimeo, etc.)',
                    },
                    {
                      name: 'posterImage',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Poster Image',
                    },
                    {
                      name: 'caption',
                      type: 'text',
                      label: 'Video Caption',
                    },
                    {
                      name: 'autoplay',
                      type: 'checkbox',
                      label: 'Autoplay',
                      defaultValue: false,
                    },
                    {
                      name: 'controls',
                      type: 'checkbox',
                      label: 'Show Controls',
                      defaultValue: true,
                    },
                  ],
                },
                {
                  slug: 'text',
                  labels: {
                    singular: 'Text Section',
                    plural: 'Text Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                    },
                    {
                      name: 'content',
                      type: 'richText',
                      label: 'Text Content',
                      required: true,
                    },
                    {
                      name: 'textAlign',
                      type: 'select',
                      label: 'Text Alignment',
                      options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                        { label: 'Justify', value: 'justify' },
                      ],
                      defaultValue: 'left',
                    },
                    {
                      name: 'maxWidth',
                      type: 'select',
                      label: 'Max Width',
                      options: [
                        { label: 'Full Width', value: 'full' },
                        { label: 'Narrow', value: 'narrow' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Wide', value: 'wide' },
                      ],
                      defaultValue: 'medium',
                    },
                    // Enhanced styling options
                    {
                      name: 'backgroundColor',
                      type: 'select',
                      label: 'Background Color',
                      options: [
                        { label: 'Transparent', value: 'transparent' },
                        { label: 'Background', value: 'background' },
                        { label: 'Muted', value: 'muted' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                      defaultValue: 'transparent',
                    },
                    {
                      name: 'padding',
                      type: 'select',
                      label: 'Section Padding',
                      options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Default', value: 'default' },
                        { label: 'Large', value: 'large' },
                        { label: 'Extra Large', value: 'xl' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'showBorder',
                      type: 'checkbox',
                      label: 'Show Border',
                      defaultValue: false,
                    },
                  ],
                },
                {
                  slug: 'image',
                  labels: {
                    singular: 'Image Section',
                    plural: 'Image Sections',
                  },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Image',
                      required: true,
                    },
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Image Title',
                    },
                    {
                      name: 'caption',
                      type: 'text',
                      label: 'Image Caption',
                    },
                    {
                      name: 'altText',
                      type: 'text',
                      label: 'Alt Text',
                    },
                    {
                      name: 'alignment',
                      type: 'select',
                      label: 'Image Alignment',
                      options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                        { label: 'Full Width', value: 'full' },
                      ],
                      defaultValue: 'center',
                    },
                    // Enhanced styling options
                    {
                      name: 'backgroundColor',
                      type: 'select',
                      label: 'Background Color',
                      options: [
                        { label: 'Transparent', value: 'transparent' },
                        { label: 'Background', value: 'background' },
                        { label: 'Muted', value: 'muted' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                      ],
                      defaultValue: 'transparent',
                    },
                    {
                      name: 'textAlignment',
                      type: 'select',
                      label: 'Text Alignment',
                      options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                      ],
                      defaultValue: 'center',
                    },
                    {
                      name: 'padding',
                      type: 'select',
                      label: 'Section Padding',
                      options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Default', value: 'default' },
                        { label: 'Large', value: 'large' },
                        { label: 'Extra Large', value: 'xl' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'maxWidth',
                      type: 'select',
                      label: 'Max Width',
                      options: [
                        { label: 'Narrow', value: 'narrow' },
                        { label: 'Default', value: 'default' },
                        { label: 'Wide', value: 'wide' },
                        { label: 'Full', value: 'full' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'showBorder',
                      type: 'checkbox',
                      label: 'Show Border',
                      defaultValue: false,
                    },
                  ],
                },
                {
                  slug: 'spacer',
                  labels: {
                    singular: 'Spacer Section',
                    plural: 'Spacer Sections',
                  },
                  fields: [
                    {
                      name: 'height',
                      type: 'select',
                      label: 'Spacer Height',
                      options: [
                        { label: 'Small (2rem)', value: 'small' },
                        { label: 'Medium (4rem)', value: 'medium' },
                        { label: 'Large (6rem)', value: 'large' },
                        { label: 'Extra Large (8rem)', value: 'xlarge' },
                      ],
                      defaultValue: 'medium',
                    },
                  ],
                },
                {
                  slug: 'divider',
                  labels: {
                    singular: 'Divider Section',
                    plural: 'Divider Sections',
                  },
                  fields: [
                    {
                      name: 'style',
                      type: 'select',
                      label: 'Divider Style',
                      options: [
                        { label: 'Solid Line', value: 'solid' },
                        { label: 'Dashed Line', value: 'dashed' },
                        { label: 'Dotted Line', value: 'dotted' },
                        { label: 'Gradient Line', value: 'gradient' },
                      ],
                      defaultValue: 'solid',
                    },
                    {
                      name: 'thickness',
                      type: 'select',
                      label: 'Line Thickness',
                      options: [
                        { label: 'Thin (1px)', value: 'thin' },
                        { label: 'Medium (2px)', value: 'medium' },
                        { label: 'Thick (4px)', value: 'thick' },
                      ],
                      defaultValue: 'medium',
                    },
                    {
                      name: 'color',
                      type: 'select',
                      label: 'Line Color',
                      options: [
                        { label: 'Default', value: 'default' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                        { label: 'Muted', value: 'muted' },
                      ],
                      defaultValue: 'default',
                    },
                  ],
                },
                {
                  slug: 'cta',
                  labels: {
                    singular: 'Call-to-Action Section',
                    plural: 'Call-to-Action Sections',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Section Title',
                      required: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Section Subtitle',
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      label: 'Description',
                    },
                    {
                      name: 'actions',
                      type: 'array',
                      label: 'Action Buttons',
                      fields: [
                        {
                          name: 'text',
                          type: 'text',
                          label: 'Button Text',
                          required: true,
                        },
                        {
                          name: 'url',
                          type: 'text',
                          label: 'Button URL',
                          required: true,
                        },
                        {
                          name: 'variant',
                          type: 'select',
                          label: 'Button Style',
                          options: [
                            { label: 'Primary', value: 'primary' },
                            { label: 'Secondary', value: 'secondary' },
                            { label: 'Outline', value: 'outline' },
                            { label: 'Ghost', value: 'ghost' },
                          ],
                          defaultValue: 'primary',
                        },
                        {
                          name: 'icon',
                          type: 'upload',
                          relationTo: 'media',
                          label: 'Button Icon',
                        },
                      ],
                    },
                    {
                      name: 'variant',
                      type: 'select',
                      label: 'Section Style',
                      options: [
                        { label: 'Default', value: 'default' },
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                        { label: 'Gradient', value: 'gradient' },
                        { label: 'Card', value: 'card' },
                      ],
                      defaultValue: 'default',
                    },
                    {
                      name: 'backgroundImage',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Background Image',
                    },
                  ],
                },
              ],
              admin: {
                description: 'Build your page using these layout blocks',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: 'Search Engine Optimization',
              fields: [
                {
                  name: 'metaTitle',
                  type: 'text',
                  label: 'Meta Title',
                  admin: {
                    description: 'Title tag for search engines (50-60 characters)',
                  },
                },
                {
                  name: 'metaDescription',
                  type: 'textarea',
                  label: 'Meta Description',
                  admin: {
                    description: 'Description for search engines (150-160 characters)',
                  },
                },
                {
                  name: 'keywords',
                  type: 'text',
                  label: 'Keywords',
                  admin: {
                    description: 'Comma-separated keywords for SEO',
                  },
                },
                {
                  name: 'ogImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Open Graph Image',
                  admin: {
                    description: 'Image for social media sharing',
                  },
                },
                {
                  name: 'ogTitle',
                  type: 'text',
                  label: 'Open Graph Title',
                  admin: {
                    description: 'Title for social media sharing',
                  },
                },
                {
                  name: 'ogDescription',
                  type: 'textarea',
                  label: 'Open Graph Description',
                  admin: {
                    description: 'Description for social media sharing',
                  },
                },
                {
                  name: 'twitterCard',
                  type: 'select',
                  label: 'Twitter Card Type',
                  options: [
                    { label: 'Summary', value: 'summary' },
                    { label: 'Summary Large Image', value: 'summary_large_image' },
                  ],
                  defaultValue: 'summary',
                },
                {
                  name: 'canonicalUrl',
                  type: 'text',
                  label: 'Canonical URL',
                  admin: {
                    description: 'Canonical URL for this page',
                  },
                },
                {
                  name: 'robots',
                  type: 'group',
                  label: 'Robots Directives',
                  fields: [
                    {
                      name: 'noIndex',
                      type: 'checkbox',
                      label: 'No Index',
                      admin: {
                        description: 'Prevent search engines from indexing this page',
                      },
                    },
                    {
                      name: 'noFollow',
                      type: 'checkbox',
                      label: 'No Follow',
                      admin: {
                        description: 'Prevent search engines from following links on this page',
                      },
                    },
                    {
                      name: 'noArchive',
                      type: 'checkbox',
                      label: 'No Archive',
                      admin: {
                        description: 'Prevent search engines from archiving this page',
                      },
                    },
                    {
                      name: 'noSnippet',
                      type: 'checkbox',
                      label: 'No Snippet',
                      admin: {
                        description: 'Prevent search engines from showing snippets of this page',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default Pages
