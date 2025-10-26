import { Payload, PayloadRequest } from 'payload'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

export async function seedMedias(payload: Payload, req: PayloadRequest) {
  await payload.delete({
    collection: 'media',
    where: {},
  })

  // Fetch only 4 unique images from Lorem Picsum to avoid rate limits
  const baseImages = [
    {
      url: 'https://picsum.photos/1920/1080?random=1',
      alt: 'Modern building exterior',
      name: 'base-image-1',
      fallback: 'media/support/image-hero1.webp',
    },
    {
      url: 'https://picsum.photos/800/600?random=2',
      alt: 'Interior space',
      name: 'base-image-2',
      fallback: 'media/support/image-post1.webp',
    },
    {
      url: 'https://picsum.photos/600/400?random=3',
      alt: 'Room interior',
      name: 'base-image-3',
      fallback: 'media/support/image-post2.webp',
    },
    {
      url: 'https://picsum.photos/800/500?random=4',
      alt: 'Common area',
      name: 'base-image-4',
      fallback: 'media/support/image-post3.webp',
    },
  ]

  // Fetch the base images with fallback
  const baseBuffers = await Promise.all(
    baseImages.map(async (config) => {
      try {
        payload.logger.info(`Attempting to fetch image from: ${config.url}`)
        return await fetchFileByURL(config.url)
      } catch (error) {
        payload.logger.warn(
          `Failed to fetch ${config.url}, attempting fallback: ${config.fallback}`,
        )
        try {
          payload.logger.info(`Attempting to read local file: ${config.fallback}`)
          return readLocalFile(config.fallback)
        } catch (fallbackError) {
          payload.logger.warn(`Fallback file ${config.fallback} also failed: ${fallbackError}`)
          payload.logger.info(`Creating placeholder image for: ${config.name}`)
          // Create a simple placeholder image buffer
          return createPlaceholderImage(config.name, config.alt)
        }
      }
    }),
  )

  // Reuse the base images for different categories
  const imageConfigs = [
    // Hero images (reusing base images)
    {
      buffer: baseBuffers[0],
      alt: 'Modern apartment building exterior',
      name: 'hero-1',
    },
    {
      buffer: baseBuffers[1],
      alt: 'Luxury residential complex',
      name: 'hero-2',
    },
    {
      buffer: baseBuffers[2],
      alt: 'Contemporary housing development',
      name: 'hero-3',
    },

    // Property images (reusing base images)
    {
      buffer: baseBuffers[0],
      alt: 'Property exterior view',
      name: 'property-1',
    },
    {
      buffer: baseBuffers[1],
      alt: 'Property entrance',
      name: 'property-2',
    },
    {
      buffer: baseBuffers[2],
      alt: 'Property garden area',
      name: 'property-3',
    },
    {
      buffer: baseBuffers[3],
      alt: 'Property parking area',
      name: 'property-4',
    },

    // Room images (reusing base images)
    {
      buffer: baseBuffers[2],
      alt: 'Single room interior',
      name: 'room-1',
    },
    {
      buffer: baseBuffers[3],
      alt: 'Two sharing room',
      name: 'room-2',
    },
    {
      buffer: baseBuffers[0],
      alt: 'Three sharing room',
      name: 'room-3',
    },
    {
      buffer: baseBuffers[1],
      alt: 'Room with amenities',
      name: 'room-4',
    },

    // Common area images (reusing base images)
    {
      buffer: baseBuffers[3],
      alt: 'Common dining area',
      name: 'common-1',
    },
    {
      buffer: baseBuffers[0],
      alt: 'Recreation area',
      name: 'common-2',
    },
    {
      buffer: baseBuffers[1],
      alt: 'Study room',
      name: 'common-3',
    },
  ]

  const medias = await Promise.all(
    imageConfigs.map((config, i) =>
      payload.create({
        collection: 'media',
        data: {
          alt: config.alt,
        },
        file: {
          ...config.buffer,
          name: `${config.name}.jpg`,
        },
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
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = Buffer.from(await res.arrayBuffer())
  const name = `picsum-${Date.now()}.jpg`
  const mimetype = 'image/jpeg'
  const size = data.length

  return { data, mimetype, name, size }
}

function readLocalFile(filePath: string): {
  data: Buffer
  mimetype: string
  name: string
  size: number
} {
  try {
    // Resolve the file path relative to the project root
    const projectRoot = process.cwd()
    const absolutePath = path.resolve(projectRoot, filePath)

    // Check if the directory exists
    const dir = path.dirname(absolutePath)
    if (!existsSync(dir)) {
      throw new Error(`Directory does not exist: ${dir}`)
    }

    // Check if the file exists
    if (!existsSync(absolutePath)) {
      throw new Error(`File does not exist: ${absolutePath}`)
    }

    const data = readFileSync(absolutePath)
    const name = path.basename(absolutePath)
    const mimetype = 'image/webp'
    const size = data.length

    return { data, mimetype, name, size }
  } catch (error) {
    throw new Error(`Failed to read local file ${filePath}: ${error}`)
  }
}

function createPlaceholderImage(
  name: string,
  alt: string,
): {
  data: Buffer
  mimetype: string
  name: string
  size: number
} {
  // Create a minimal SVG placeholder image
  const svgContent = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-family="Arial" font-size="24">
        ${alt}
      </text>
    </svg>
  `.trim()

  const data = Buffer.from(svgContent, 'utf8')
  return {
    data,
    mimetype: 'image/svg+xml',
    name: `${name}-placeholder.svg`,
    size: data.length,
  }
}
