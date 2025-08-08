import { Payload, PayloadRequest } from 'payload'

export async function seedSupportMedia(payload: Payload, req: PayloadRequest) {
  await payload.delete({
    collection: 'support-media',
    where: {},
  })
  // Use the same image URLs and data as seedMedias
  const imageUrls = [
    'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
  ]
  const buffers = await Promise.all(imageUrls.map((url) => fetchFileByURL(url)))
  const supportMedias = await Promise.all(
    buffers.map((buffer, i) =>
      payload.create({
        collection: 'support-media',
        data: {
          alt: `Support Media ${i + 1}`,
          description: `Seeded support media file ${i + 1}`,
        },
        file: buffer,
      }),
    ),
  )
  return supportMedias
}

async function fetchFileByURL(
  url: string,
): Promise<{ data: Buffer; mimetype: string; name: string; size: number }> {
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  const name = url.split('/').pop() || 'file'
  return {
    data: buffer,
    mimetype: contentType,
    name,
    size: buffer.length,
  }
}
