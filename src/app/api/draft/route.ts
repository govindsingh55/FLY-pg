import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const secret = searchParams.get('secret')

  if (!slug || !secret) {
    return new NextResponse('Missing slug or secret', { status: 400 })
  }

  // Redirect to the preview page instead of rendering HTML directly
  const previewUrl = `/preview?slug=${encodeURIComponent(slug)}&type=draft&secret=${encodeURIComponent(secret)}`

  return NextResponse.redirect(new URL(previewUrl, request.url))
}
