import { NextRequest, NextResponse } from 'next/server'
import { PageData } from '@/lib/payload/pages'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageData } = body

    if (!pageData) {
      return new NextResponse('Missing page data', { status: 400 })
    }

    // Validate the page data structure
    const page: PageData = {
      id: pageData.id || 'preview',
      title: pageData.title || 'Untitled Page',
      slug: pageData.slug || 'untitled',
      status: pageData.status || 'draft',
      seo: pageData.seo,
      layout: pageData.layout,
      theme: pageData.theme,
    }

    // Return the page data for live preview
    return NextResponse.json({
      success: true,
      page,
      previewUrl: generatePreviewUrl(page),
    })
  } catch (error) {
    console.error('Error in live preview:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

function generatePreviewUrl(page: PageData): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (page.status === 'published') {
    return `${baseUrl}/preview?slug=${page.slug}&type=published`
  }

  return `${baseUrl}/preview?slug=${page.slug}&type=draft&secret=${process.env.PREVIEW_SECRET}`
}
