import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import path from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const width = searchParams.get('width')
    const quality = searchParams.get('quality') || '75'

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Find the media record by filename
    const media = await payload.find({
      collection: 'media',
      where: {
        filename: {
          equals: filename,
        },
      },
      limit: 1,
    })

    if (!media.docs.length) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const mediaDoc = media.docs[0]
    const mediaPath = path.resolve(process.cwd(), 'media/public', filename)

    // Check if file exists
    if (!existsSync(mediaPath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(mediaPath)

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', mediaDoc.mimeType || 'image/jpeg')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('Content-Length', fileBuffer.length.toString())

    // Add CORS headers if needed
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')

    // Add timeout headers to prevent upstream timeouts
    headers.set('X-Timeout', '30s')

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error serving media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
