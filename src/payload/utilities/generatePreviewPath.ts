import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
  properties: '/properties',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug, req }: Props) => {
  // Ensure collection exists in map
  const prefix = collectionPrefixMap[collection] ?? ''
  // Remove double slashes if prefix is empty
  const path = prefix ? `${prefix}/${slug}` : `/${slug}`

  const previewSecret = process.env.PREVIEW_SECRET || ''

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path,
    previewSecret,
  })

  return `/next/preview?${encodedParams.toString()}`
}
