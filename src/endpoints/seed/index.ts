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
  try {
    payload.logger.info('Seeding database...')

    const collectionData: Record<string, unknown> = {}

    // Seed base collections first
    payload.logger.info(`— Seeding users...`)
    const users = await seedUsers(payload, req)
    collectionData['users'] = users.map((u: any) => u.id)
    payload.logger.info(`— Users seeded successfully!`)

    payload.logger.info(`— Seeding customers...`)
    const customers = await seedCustomers(payload, req)
    collectionData['customers'] = customers.map((c: any) => c.id)
    payload.logger.info(`— Customers seeded successfully!`)

    payload.logger.info(`— Seeding food menu...`)
    const foodMenu = await seedFoodMenu(payload, req)
    collectionData['foodmenu'] = foodMenu.map((f: any) => f.id)
    payload.logger.info(`— FoodMenu seeded successfully!`)

    payload.logger.info(`— Seeding rooms...`)
    const rooms = await seedRooms(payload, req)
    collectionData['rooms'] = rooms.map((r: any) => r._id || r.id)
    payload.logger.info(`— Rooms seeded successfully!`)

    payload.logger.info(`— Seeding media...`)
    const medias = await seedMedias(payload, req)
    collectionData['media'] = medias.map((media: Media) => media.id)
    payload.logger.info(`— Media seeded successfully!`)

    // Seed dependent collections
    console.log('DEBUG: collectionData["rooms"]:', collectionData['rooms'])
    payload.logger.info(`— Seeding properties...`)
    const properties = await seedProperties(payload, req, {
      foodMenuId: (collectionData['foodmenu'] as string[])[0],
      roomIds: collectionData['rooms'] as string[],
      managerId: (collectionData['users'] as string[])[0],
    })
    collectionData['properties'] = properties.map((p: any) => p.id)
    payload.logger.info(`— Properties seeded successfully!`)

    payload.logger.info(`— Seeding bookings...`)
    const bookings = await seedBookings(payload, req, {
      propertyId: (collectionData['properties'] as string[])[0],
      customerId: (collectionData['customers'] as string[])[0],
      roomId: (collectionData['rooms'] as string[])[0],
    })
    collectionData['bookings'] = bookings.map((b: any) => b.id)
    payload.logger.info(`— Bookings seeded successfully!`)

    payload.logger.info(`— Seeding visit bookings...`)
    const visitBookings = await seedVisitBookings(payload, req, {
      propertyId: (collectionData['properties'] as string[])[0],
      customerId: (collectionData['customers'] as string[])[0],
    })
    collectionData['visitbookings'] = visitBookings.map((v: any) => v.id)
    payload.logger.info(`— VisitBookings seeded successfully!`)

    payload.logger.info(`— Seeding support media...`)
    const supportMedia = await seedSupportMedia(payload, req)
    collectionData['supportmedia'] = supportMedia.map((s: any) => s.id)
    payload.logger.info(`— SupportMedia seeded successfully!`)

    payload.logger.info(`— Seeding support tickets...`)
    const supportTickets = await seedSupportTickets(payload, req, {
      customerIds: collectionData['customers'] as string[],
    })
    collectionData['supporttickets'] = supportTickets.map((s: any) => s.id)
    payload.logger.info(`— SupportTickets seeded successfully!`)

    payload.logger.info('Seeded database successfully!')
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    payload.logger.error('Error during seeding:', errorMsg)
    console.log('Error during seeding:', errorMsg)
    throw error
  }
}
