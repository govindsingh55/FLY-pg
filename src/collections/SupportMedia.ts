import type { CollectionConfig } from 'payload'

const SupportMedia: CollectionConfig = {
  slug: 'support-media',
  admin: { useAsTitle: 'filename' },
  upload: {
    staticDir: 'media/support',
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        fit: 'cover',
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Alt Text', required: false },
    { name: 'description', type: 'textarea', required: false },
  ],
}

export default SupportMedia
