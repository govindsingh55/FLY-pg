import type { Payload, PayloadRequest } from 'payload'
import { seedMedias } from './medias'
import { seedBookings } from './collections/bookings'
import { seedCustomers } from './collections/customers'
import { seedFoodMenu } from './collections/foodMenu'
import { seedSupportMedia } from './collections/supportMedia'
import { seedSupportTickets } from './collections/supportTickets'
import { seedUsers } from './collections/users'
import { seedVisitBookings } from './collections/visitBookings'
import { seedProperties } from './collections/properties'
import { seedRooms } from './collections/rooms'
import { Media } from '@/payload/payload-types'
import { seedAmenities } from './amenities'

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`

// Helper function to add delay between operations
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Collection definitions with dependencies
const COLLECTION_DEFINITIONS = {
  users: { dependencies: [], isBase: true },
  customers: { dependencies: [], isBase: true },
  foodmenu: { dependencies: [], isBase: true },
  amenities: { dependencies: [], isBase: true },
  media: { dependencies: [], isBase: true },
  supportmedia: { dependencies: [], isBase: true },
  rooms: { dependencies: ['amenities'], isBase: false },
  properties: { dependencies: ['foodmenu', 'rooms', 'users', 'amenities'], isBase: false },
  bookings: { dependencies: ['properties', 'customers', 'rooms'], isBase: false },
  visitbookings: { dependencies: ['properties', 'customers'], isBase: false },
  supporttickets: { dependencies: ['customers'], isBase: false },
}

// Helper function to resolve dependencies
const resolveDependencies = (selectedCollections: string[]): string[] => {
  const resolved = new Set<string>()

  const addWithDependencies = (collection: string) => {
    if (resolved.has(collection)) return

    const definition = COLLECTION_DEFINITIONS[collection as keyof typeof COLLECTION_DEFINITIONS]
    if (definition) {
      // Add dependencies first
      definition.dependencies.forEach((dep) => addWithDependencies(dep))
      // Then add the collection itself
      resolved.add(collection)
    }
  }

  selectedCollections.forEach((collection) => addWithDependencies(collection))
  return Array.from(resolved)
}

export const seed = async ({
  payload,
  req,
  selectedCollections,
}: {
  payload: Payload
  req: PayloadRequest
  selectedCollections?: string[]
}): Promise<void> => {
  try {
    // Determine which collections to seed
    const collectionsToSeed = selectedCollections
      ? resolveDependencies(selectedCollections)
      : Object.keys(COLLECTION_DEFINITIONS)

    console.info(`Seeding database with collections: ${collectionsToSeed.join(', ')}...`)

    const collectionData: Record<string, unknown> = {}

    // Define seeding functions for each collection
    const seedFunctions: Record<string, () => Promise<void>> = {
      users: async () => {
        console.info(`— Seeding users...`)
        const users = await seedUsers(payload, req)
        collectionData['users'] = users.map((u: any) => u.id)
        console.info(`— Users seeded successfully!`)
        await delay(1000)
      },
      customers: async () => {
        console.info(`— Seeding customers...`)
        const customers = await seedCustomers(payload, req)
        collectionData['customers'] = customers.map((c: any) => c.id)
        console.info(`— Customers seeded successfully!`)
        await delay(1000)
      },
      foodmenu: async () => {
        console.info(`— Seeding food menu...`)
        const foodMenu = await seedFoodMenu(payload, req)
        collectionData['foodmenu'] = foodMenu.map((f: any) => f.id)
        console.info(`— FoodMenu seeded successfully!`)
        await delay(1000)
      },
      amenities: async () => {
        console.info(`— Seeding amenities...`)
        const amenities = await seedAmenities(payload)
        collectionData['amenities'] = amenities || []
        console.info(`— Amenities seeded successfully!`)
        await delay(1000)
      },
      media: async () => {
        console.info(`— Seeding media...`)
        try {
          const medias = await seedMedias(payload, req)
          collectionData['media'] = medias.map((media: Media) => media.id)
          console.info(`— Media seeded successfully!`)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          console.warn(`— Media seeding encountered issues: ${errorMsg}`)
          collectionData['media'] = []
        }
        await delay(2000)
      },
      supportmedia: async () => {
        console.info(`— Seeding support media...`)
        const supportMedia = await seedSupportMedia(payload, req)
        collectionData['supportmedia'] = supportMedia.map((s: any) => s.id)
        console.info(`— SupportMedia seeded successfully!`)
        await delay(1000)
      },
      rooms: async () => {
        console.info(`— Seeding rooms...`)
        const rooms = await seedRooms(payload, req, collectionData['amenities'] as string[])
        collectionData['rooms'] = rooms.map((r: any) => r._id || r.id)
        console.info(`— Rooms seeded successfully!`)
        await delay(1000)
      },
      properties: async () => {
        console.info(`— Seeding properties...`)
        const properties = await seedProperties(payload, req, {
          foodMenuId: (collectionData['foodmenu'] as string[])?.[0],
          roomIds: collectionData['rooms'] as string[],
          managerId: (collectionData['users'] as string[])?.[0],
          amenityIds: collectionData['amenities'] as string[],
        })
        collectionData['properties'] = properties.map((p: any) => p.id)
        console.info(`— Properties seeded successfully!`)
        await delay(2000)
      },
      bookings: async () => {
        console.info(`— Seeding bookings...`)
        const bookings = await seedBookings(payload, req, {
          propertyId: (collectionData['properties'] as string[])?.[0],
          customerId: (collectionData['customers'] as string[])?.[0],
          roomId: (collectionData['rooms'] as string[])?.[0],
        })
        collectionData['bookings'] = bookings.map((b: any) => b.id)
        console.info(`— Bookings seeded successfully!`)
        await delay(1500)
      },
      visitbookings: async () => {
        console.info(`— Seeding visit bookings...`)
        const visitBookings = await seedVisitBookings(payload, req, {
          propertyId: (collectionData['properties'] as string[])?.[0],
          customerId: (collectionData['customers'] as string[])?.[0],
        })
        collectionData['visitbookings'] = visitBookings.map((v: any) => v.id)
        console.info(`— VisitBookings seeded successfully!`)
        await delay(1000)
      },
      supporttickets: async () => {
        console.info(`— Seeding support tickets...`)
        const supportTickets = await seedSupportTickets(payload, req, {
          customerIds: collectionData['customers'] as string[],
          propertyIds: collectionData['properties'] as string[],
        })
        collectionData['supporttickets'] = supportTickets.map((s: any) => s.id)
        console.info(`— SupportTickets seeded successfully!`)
        await delay(1000)
      },
    }

    // Execute seeding functions in dependency order
    for (const collection of collectionsToSeed) {
      const seedFunction = seedFunctions[collection]
      if (seedFunction) {
        await seedFunction()
      } else {
        console.warn(`— No seeding function found for collection: ${collection}`)
      }
    }

    console.info(`Seeded database successfully! Collections: ${collectionsToSeed.join(', ')}`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Error during seeding:', errorMsg)
    console.log('Error during seeding:', errorMsg)
    throw error
  }
}
