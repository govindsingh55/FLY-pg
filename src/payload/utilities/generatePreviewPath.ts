import { PayloadRequest, CollectionSlug } from 'payload'
import { getServerSideURL } from './getUrl'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
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

  // Get the base URL from environment variable or request headers
  let baseUrl = getServerSideURL()

  // If we have request headers and no NEXT_PUBLIC_SITE_URL is set, try to construct URL from headers
  if (baseUrl.includes('localhost') && req?.headers) {
    const host = req.headers.get?.('host') || (req.headers as any)?.host
    const protocol =
      req.headers.get?.('x-forwarded-proto') ||
      (req.headers as any)?.['x-forwarded-proto'] ||
      (req.headers.get?.('x-forwarded-ssl') === 'on' ||
      (req.headers as any)?.['x-forwarded-ssl'] === 'on'
        ? 'https'
        : 'http')

    if (host) {
      baseUrl = `${protocol}://${host}`
    }
  }

  return `${baseUrl}/next/preview?${encodedParams.toString()}`
}
