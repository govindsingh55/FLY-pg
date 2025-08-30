import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const collection = searchParams.get('collection')
  const path = searchParams.get('path')
  const previewSecret = searchParams.get('previewSecret')

  // Validate preview secret
  const expectedSecret = process.env.PREVIEW_SECRET
  if (!expectedSecret || previewSecret !== expectedSecret) {
    return new NextResponse('Invalid preview secret', { status: 401 })
  }

  // Validate required parameters
  if (!slug || !collection || !path) {
    return new NextResponse('Missing required parameters', { status: 400 })
  }

  try {
    const payload = await getPayload({ config })

    // Fetch the document by slug
    const result = await payload.find({
      collection: collection as any,
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })

    const doc = result.docs[0]
    if (!doc) {
      return new NextResponse('Document not found', { status: 404 })
    }

    // Set preview cookies to enable preview mode
    const response = NextResponse.redirect(new URL(path, request.url))

    // Set preview cookies
    response.cookies.set('payload-preview', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    })

    response.cookies.set('payload-preview-secret', previewSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    })

    return response
  } catch (error) {
    console.error('Preview error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
