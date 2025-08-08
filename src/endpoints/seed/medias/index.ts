import { Payload, PayloadRequest } from 'payload'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { image3 } from './image-3'
import { imageHero1 } from './image-hero-1'

export async function seedMedias(payload: Payload, req: PayloadRequest) {
  await payload.delete({
    collection: 'media',
    where: {},
  })
  const imageUrls = [
    'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
  ]
  const imageData = [image1, image2, image3, imageHero1]
  const buffers = await Promise.all(imageUrls.map((url) => fetchFileByURL(url)))
  const medias = await Promise.all(
    buffers.map((buffer, i) =>
      payload.create({
        collection: 'media',
        data: imageData[i],
        file: buffer,
      }),
    ),
  )
  return medias.map((media) => {
    if (!media) {
      throw new Error('Media creation failed')
    }
    return media
  })
}

async function fetchFileByURL(
  url: string,
): Promise<{ data: Buffer; mimetype: string; name: string; size: number }> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = Buffer.from(await res.arrayBuffer())
  const name = url.split('/').pop() || `file-${Date.now()}`
  const mimetype = `image/${name.split('.').pop()}`
  const size = data.length

  return { data, mimetype, name, size }
}
