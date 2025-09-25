import { getClientSideURL } from '@/payload/utilities/getUrl'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // For local media files, try to use our custom media endpoint first
  if (url.startsWith('/media/')) {
    const baseUrl = getClientSideURL()
    const filename = url.split('/').pop()
    const customUrl = `${baseUrl}/api/custom/media?filename=${filename}`
    return cacheTag ? `${customUrl}&${cacheTag}` : customUrl
  }

  // Otherwise prepend client-side URL
  const baseUrl = getClientSideURL()
  return cacheTag ? `${baseUrl}${url}?${cacheTag}` : `${baseUrl}${url}`
}
