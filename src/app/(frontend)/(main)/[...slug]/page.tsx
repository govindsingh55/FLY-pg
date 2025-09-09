import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/payload/pages'
import { isRouteProtected } from '@/lib/config/protected-routes'
import { PageRenderer, generatePageMetadata } from '@/components/pages/PageRenderer'

interface DynamicPageProps {
  params: Promise<{
    slug: string[]
  }>
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const { slug } = await params
  const fullSlug = `/${slug.join('/')}`

  console.log('DynamicPage: Attempting to load slug:', fullSlug)

  // Skip static assets and common files
  const staticAssets = ['favicon.ico', 'robots.txt', 'sitemap.xml', 'manifest.json']
  const fileName = slug[slug.length - 1]
  if (staticAssets.includes(fileName) || fileName.includes('.')) {
    console.log('DynamicPage: Skipping static asset:', fullSlug)
    notFound()
  }

  // Check if route is protected (existing manual pages)
  if (isRouteProtected(fullSlug)) {
    console.log('DynamicPage: Route is protected:', fullSlug)
    notFound()
  }

  try {
    // Fetch page from PayloadCMS
    console.log('DynamicPage: Fetching page from PayloadCMS...')
    const page = await getPageBySlug(fullSlug)
    console.log('DynamicPage: Page result:', page ? 'Found' : 'Not found')

    if (!page) {
      console.log('DynamicPage: No page found for slug:', fullSlug)
      notFound()
    }

    if (page.status !== 'published') {
      console.log('DynamicPage: Page exists but not published:', page.status)
      notFound()
    }

    console.log('DynamicPage: Rendering page:', page.title)
    return <PageRenderer page={page} />
  } catch (error) {
    console.error('DynamicPage: Error fetching page:', error)
    notFound()
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: DynamicPageProps) {
  const { slug } = await params
  const fullSlug = `/${slug.join('/')}`

  // Skip metadata generation for static assets
  const staticAssets = ['favicon.ico', 'robots.txt', 'sitemap.xml', 'manifest.json']
  const fileName = slug[slug.length - 1]
  if (staticAssets.includes(fileName) || fileName.includes('.')) {
    return {
      title: 'Static Asset',
    }
  }

  try {
    const page = await getPageBySlug(fullSlug)
    if (page && page.status === 'published') {
      return generatePageMetadata(page)
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: 'Page Not Found',
  }
}

// Generate static params for known pages (optional optimization)
export async function generateStaticParams() {
  // This could be used to pre-generate static pages for better performance
  // For now, we'll use dynamic rendering
  return []
}

// Enable dynamic rendering
export const dynamic = 'force-dynamic'
