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

  // If we don't have a baseUrl (production without NEXT_PUBLIC_SITE_URL) or it's localhost,
  // try to construct URL from request headers
  if (!baseUrl || (baseUrl.includes('localhost') && process.env.NODE_ENV === 'production')) {
    if (req?.headers) {
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
  }

  // If we still don't have a baseUrl, we can't generate a preview path
  if (!baseUrl) {
    console.error(
      'Unable to determine base URL for preview. Set NEXT_PUBLIC_SITE_URL environment variable.',
    )
    return ''
  }

  return `${baseUrl}/next/preview?${encodedParams.toString()}`
}
