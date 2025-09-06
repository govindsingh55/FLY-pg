import { NextRequest, NextResponse } from 'next/server'
import { getDraftPage } from '@/lib/payload/pages'
import { generatePageMetadata } from '@/components/pages/PageRenderer'
import { renderToString } from 'react-dom/server'
import React from 'react'
import { PageRenderer } from '@/components/pages/PageRenderer'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const secret = searchParams.get('secret')

  if (!slug || !secret) {
    return new NextResponse('Missing slug or secret', { status: 400 })
  }

  try {
    const page = await getDraftPage(slug, secret)

    if (!page) {
      return new NextResponse('Page not found', { status: 404 })
    }

    // Generate metadata for the page
    const metadata = generatePageMetadata(page)

    // Render the page component to string
    const pageHtml = renderToString(React.createElement(PageRenderer, { page }))

    // Return the rendered page as HTML
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${metadata.title || page.title} - Draft Preview</title>
          <meta name="description" content="${metadata.description || ''}" />
          <meta name="robots" content="noindex, nofollow" />
          ${metadata.openGraph?.images ? `<meta property="og:image" content="${metadata.openGraph.images[0]}" />` : ''}
          ${metadata.openGraph?.title ? `<meta property="og:title" content="${metadata.openGraph.title}" />` : ''}
          ${metadata.openGraph?.description ? `<meta property="og:description" content="${metadata.openGraph.description}" />` : ''}
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
            }
            .draft-notice {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: #ff6b6b;
              color: white;
              padding: 8px 16px;
              text-align: center;
              font-size: 14px;
              font-weight: 500;
              z-index: 1000;
            }
            .draft-content {
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <div class="draft-notice">
            📝 Draft Preview - This page is not publicly visible
          </div>
          <div class="draft-content">
            ${pageHtml}
          </div>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      },
    )
  } catch (error) {
    console.error('Error in draft preview:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
