import React from 'react'
import { Metadata } from 'next'
import { PageData } from '@/lib/payload/pages'
import { BlockRenderer } from './BlockRenderer'

interface PageRendererProps {
  page: PageData
}

export function PageRenderer({ page }: PageRendererProps) {
  const themeClass = page.theme?.colorScheme || 'default'
  const backgroundVariant = page.theme?.backgroundVariant || 'default'

  return (
    <div className={`page-${themeClass} bg-${backgroundVariant} w-full`}>
      {page.layout?.map((block, index) => (
        <BlockRenderer key={`${block.blockType}-${index}`} block={block} />
      ))}
    </div>
  )
}

export function generatePageMetadata(page: PageData): Metadata {
  const metaTitle = page.seo?.metaTitle || page.title
  const metaDescription = page.seo?.metaDescription
  const ogTitle = page.seo?.ogTitle || metaTitle
  const ogDescription = page.seo?.ogDescription || metaDescription
  const ogImage = page.seo?.ogImage
  const canonicalUrl = page.seo?.canonicalUrl

  // Build robots string
  const robotsDirectives = []
  if (page.seo?.robots?.noIndex) robotsDirectives.push('noindex')
  if (page.seo?.robots?.noFollow) robotsDirectives.push('nofollow')
  if (page.seo?.robots?.noArchive) robotsDirectives.push('noarchive')
  if (page.seo?.robots?.noSnippet) robotsDirectives.push('nosnippet')
  const robots = robotsDirectives.length > 0 ? robotsDirectives.join(', ') : undefined

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: page.seo?.keywords,
    robots: robots,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
      type: 'website',
    },
    twitter: {
      card: page.seo?.twitterCard || 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}
