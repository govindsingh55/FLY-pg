import { notFound } from 'next/navigation'
import { getPageBySlug, getDraftPage } from '@/lib/payload/pages'
import { PageRenderer } from '@/components/pages/PageRenderer'

interface PreviewPageProps {
  searchParams: Promise<{
    slug?: string
    secret?: string
    type?: 'draft' | 'published'
  }>
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const { slug, secret, type = 'draft' } = await searchParams

  if (!slug) {
    notFound()
  }

  try {
    let page

    if (type === 'draft') {
      if (!secret) {
        notFound()
      }
      page = await getDraftPage(slug, secret)
    } else {
      page = await getPageBySlug(slug)
    }

    if (!page) {
      notFound()
    }

    return (
      <>
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
          📝 Live Preview - {type === 'draft' ? 'Draft' : 'Published'} Page
        </div>
        <div className="pt-8">
          <PageRenderer page={page} />
        </div>
      </>
    )
  } catch (error) {
    console.error('Error in preview:', error)
    notFound()
  }
}

// Generate metadata for the preview page
export async function generateMetadata({ searchParams }: PreviewPageProps) {
  const { slug, type = 'draft' } = await searchParams

  if (!slug) {
    return {
      title: 'Preview Not Found',
    }
  }

  try {
    let page

    if (type === 'draft') {
      const { secret } = await searchParams
      page = await getDraftPage(slug, secret || '')
    } else {
      page = await getPageBySlug(slug)
    }

    if (page) {
      return {
        title: `${page.title} - Preview`,
        robots: 'noindex, nofollow',
      }
    }
  } catch (error) {
    console.error('Error generating preview metadata:', error)
  }

  return {
    title: 'Preview Not Found',
    robots: 'noindex, nofollow',
  }
}
