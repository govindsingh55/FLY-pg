import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'
import bookingsSeed from './bookings'
import categoriesSeed from './categories'
import customersSeed from './customers'
import foodMenuSeed from './food-menu'
import mediaSeed from './media'
import supportMediaSeed from './support-media'
import supportTicketsSeed from './support-tickets'
import visitBookingsSeed from './visit-bookings'
import propertiesSeed from './properties'
import roomsSeed from './rooms'
import { Property } from '@/payload-types'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
  'bookings',
  'customers',
  'food-menu',
  'support-media',
  'support-tickets',
  'visit-bookings',
  'properties',
  'rooms',
]
const globals: GlobalSlug[] = ['header', 'footer']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // Remove all data from each collection right before seeding it
  payload.logger.info('— Removing all data from collections before seeding each one...')
  for (const collection of collections) {
    payload.logger.info(`— Clearing collection: ${collection}`)
    await payload.db.deleteMany({ collection, req, where: {} })
  }

  // Clear globals (reset navItems)
  payload.logger.info(`— Clearing collections and globals...`)
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  // Remove all versions if versioning is enabled
  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })

  payload.logger.info(`— Seeding media...`)
  // For each mediaSeed item, fetch a demo image and upload it as the file
  const demoImageUrl =
    'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp'
  const seededMedia: Array<{ id: string; createdAt: string; updatedAt: string }> = []
  for (const media of mediaSeed) {
    const fileBuffer = await fetchFileByURL(demoImageUrl)
    const mediaData = {
      ...media,
      caption:
        typeof media.caption === 'string'
          ? {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: media.caption, type: 'text', version: 1 }],
                    direction: 'ltr' as 'ltr',
                    format: '' as '',
                    indent: 0,
                    version: 1,
                  },
                ],
                direction: 'ltr' as 'ltr',
                format: '' as '',
                indent: 0,
                version: 1,
              },
            }
          : media.caption,
    }
    const doc = await payload.create({
      collection: 'media',
      data: mediaData,
      file: fileBuffer,
    })
    seededMedia.push(doc)
  }

  // Seed demo author
  const demoAuthor = await payload.create({
    collection: 'users',
    data: {
      name: 'Demo Author',
      email: 'demo-author@example.com',
      password: 'password',
      role: 'admin',
    },
  })

  payload.logger.info(`— Seeding categories...`)
  for (const category of categoriesSeed) {
    await payload.create({
      collection: 'categories',
      data: category,
    })
  }

  // Use seededMedia for posts and pages
  const image1Doc = seededMedia[0]
  const image2Doc = seededMedia[1] || seededMedia[0]
  const image3Doc = seededMedia[2] || seededMedia[0]
  const imageHomeDoc = seededMedia[3] || seededMedia[0]

  // ...existing code...
  // ...existing code...

  payload.logger.info(`— Seeding posts...`)
  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })
  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })
  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
  })
  // update each post with related posts
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id],
    },
  })

  // --- SEED IN ORDER: users, customers, properties, rooms, visit-bookings, bookings, others ---

  // 1. Seed customers (users already seeded above as demoAuthor)
  payload.logger.info(`— Seeding customers...`)
  // Always use deleteMany to clear the customers collection before seeding
  await payload.db.deleteMany({ collection: 'customers', req, where: {} })
  const seededCustomers = []
  for (const customer of customersSeed) {
    const doc = await payload.create({ collection: 'customers', data: customer })
    seededCustomers.push(doc)
  }

  // 2. Seed properties
  payload.logger.info(`— Seeding properties...`)
  const seededProperties = []
  for (let i = 0; i < propertiesSeed.length; i++) {
    const property = propertiesSeed[i]
    // Omit foodMenu from the property seed object
    const { foodMenu, ...propertyData }: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = property

    // Assign demoAuthor as manager
    if (propertyData.manager && typeof propertyData.manager === 'string') {
      propertyData.manager = demoAuthor.id
    }

    // Assign full media object for images and meta.image
    if (Array.isArray(propertyData.images)) {
      propertyData.images = propertyData.images.map((img, idx) => ({
        ...img,
        image: seededMedia[0],
      }))
    }
    if (propertyData.meta && typeof propertyData.meta === 'object') {
      propertyData.meta.image = seededMedia[i % seededMedia.length]
    }

    const doc = await payload.create({ collection: 'properties', data: propertyData })
    seededProperties.push(doc)
  }

  // 3. Seed food menus
  payload.logger.info(`— Seeding food menus...`)
  const seededFoodMenus = []
  for (let i = 0; i < foodMenuSeed.length; i++) {
    const foodMenu = { ...foodMenuSeed[i] }
    const doc = await payload.create({ collection: 'food-menu', data: foodMenu })
    seededFoodMenus.push(doc)
  }

  // 3. Seed rooms (assign property IDs from seededProperties)
  payload.logger.info(`— Seeding rooms...`)
  const seededRooms = []
  for (let i = 0; i < roomsSeed.length; i++) {
    const room = { ...roomsSeed[i], property: seededProperties[i % seededProperties.length].id }
    const doc = await payload.create({ collection: 'rooms', data: room })
    seededRooms.push(doc)
  }

  // 4. Seed visit bookings (assign customer/property IDs)
  payload.logger.info(`— Seeding visit bookings...`)
  for (let i = 0; i < visitBookingsSeed.length; i++) {
    const visit = {
      ...visitBookingsSeed[i],
      customer: seededCustomers[i % seededCustomers.length].id,
      property: seededProperties[i % seededProperties.length].id,
    }
    await payload.create({ collection: 'visit-bookings', data: visit })
  }

  // 5. Seed bookings (assign customer/property/room IDs)
  payload.logger.info(`— Seeding bookings...`)
  for (let i = 0; i < bookingsSeed.length; i++) {
    const booking = {
      ...bookingsSeed[i],
      customer: seededCustomers[i % seededCustomers.length].id,
      property: seededProperties[i % seededProperties.length].id,
      room: seededRooms[i % seededRooms.length].id,
    }
    await payload.create({ collection: 'bookings', data: booking })
  }

  // 6. Seed other collections
  payload.logger.info(`— Seeding food menu...`)
  for (let i = 0; i < foodMenuSeed.length; i++) {
    const food = {
      ...foodMenuSeed[i],
      property: seededProperties[i % seededProperties.length].id,
    }
    await payload.create({ collection: 'food-menu', data: food })
  }

  payload.logger.info(`— Seeding support media...`)
  for (const media of supportMediaSeed) {
    const fileBuffer = await fetchFileByURL(demoImageUrl)
    await payload.create({
      collection: 'support-media',
      data: media,
      file: fileBuffer,
    })
  }

  payload.logger.info(`— Seeding support tickets...`)
  for (let i = 0; i < supportTicketsSeed.length; i++) {
    const ticketData = {
      ...supportTicketsSeed[i],
      customer: seededCustomers[i % seededCustomers.length].id,
      createdAt: new Date().toISOString(),
    }
    payload.logger.info(`[SupportTickets] Seeding ticket #${i + 1}: ${JSON.stringify(ticketData)}`)
    try {
      const result = await payload.create({
        collection: 'support-tickets',
        data: ticketData,
      })
      payload.logger.info(`[SupportTickets] Created ticket #${i + 1}`)
    } catch (err) {
      payload.logger.error(`[SupportTickets] Error creating ticket #${i + 1}:`, err)
      throw err
    }
  }

  payload.logger.info(`— Seeding contact form...`)
  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
  })

  payload.logger.info(`— Seeding pages...`)
  const [__, contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      data: home({ heroImage: imageHomeDoc, metaImage: image2Doc }),
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({ contactForm: contactForm }),
    }),
  ])

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Posts',
              url: '/posts',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Admin',
              url: '/admin',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Source Code',
              newTab: true,
              url: 'https://github.com/payloadcms/payload/tree/main/templates/website',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Payload',
              newTab: true,
              url: 'https://payloadcms.com/',
            },
          },
        ],
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
