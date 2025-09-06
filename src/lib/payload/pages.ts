import { getPayload } from 'payload'
import config from '@/payload/payload.config'

export interface PageData {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  layout?: Array<{
    blockType: string
    [key: string]: any
  }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
    ogImage?: string
    ogTitle?: string
    ogDescription?: string
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
    canonicalUrl?: string
    robots?: {
      noIndex?: boolean
      noFollow?: boolean
      noArchive?: boolean
      noSnippet?: boolean
    }
  }
  theme?: {
    colorScheme?: string
    backgroundVariant?: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * Get a page by its slug
 */
export async function getPageBySlug(slug: string): Promise<PageData | null> {
  try {
    console.log('getPageBySlug: Looking for slug:', slug)
    const payload = await getPayload({ config })
    console.log('getPageBySlug: Payload instance created successfully')

    const cleanSlug = slug.replace(/^\//, '') // Remove leading slash
    console.log('getPageBySlug: Clean slug:', cleanSlug)

    const result = await payload.find({
      collection: 'pages' as any, // Temporary fix until types are regenerated
      where: {
        slug: {
          equals: cleanSlug,
        },
      },
      limit: 1,
    })

    console.log('getPageBySlug: Query result:', {
      totalDocs: result.totalDocs,
      docsLength: result.docs.length,
      found: result.docs.length > 0,
    })

    if (result.docs.length === 0) {
      console.log('getPageBySlug: No pages found for slug:', cleanSlug)
      return null
    }

    const page = result.docs[0] as any // Temporary fix until types are regenerated
    console.log('getPageBySlug: Found page:', {
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
    })

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      layout: page.layout,
      seo: page.seo,
      theme: page.theme,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    }
  } catch (error) {
    console.error('getPageBySlug: Error fetching page:', error)
    return null
  }
}

/**
 * Get all published pages (for sitemap, navigation, etc.)
 */
export async function getAllPublishedPages(): Promise<PageData[]> {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'pages' as any, // Temporary fix until types are regenerated
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 1000, // Adjust as needed
    })

    return result.docs.map((page: any) => ({
      // Temporary fix until types are regenerated
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      layout: page.layout,
      seo: page.seo,
      theme: page.theme,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    }))
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}

/**
 * Get page for draft preview
 */
export async function getDraftPage(slug: string, secret: string): Promise<PageData | null> {
  // Verify preview secret
  if (secret !== process.env.PREVIEW_SECRET) {
    return null
  }

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'pages' as any, // Temporary fix until types are regenerated
      where: {
        slug: {
          equals: slug.replace(/^\//, ''),
        },
      },
      limit: 1,
    })

    if (result.docs.length === 0) {
      return null
    }

    const page = result.docs[0] as any // Temporary fix until types are regenerated

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      layout: page.layout,
      seo: page.seo,
      theme: page.theme,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    }
  } catch (error) {
    console.error('Error fetching draft page:', error)
    return null
  }
}
