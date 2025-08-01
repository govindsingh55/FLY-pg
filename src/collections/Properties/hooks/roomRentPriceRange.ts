import { type CollectionAfterChangeHook } from 'payload'
import type { Property, Room } from '@/payload-types'
const roomRentPriceRange: CollectionAfterChangeHook<Property> = async ({ doc, req, operation }) => {
  if (operation === 'update' || operation === 'create') {
    if (doc.rooms && Array.isArray(doc.rooms) && doc.rooms?.length > 0) {
      const rooms = await req.payload.find({
        collection: 'rooms',
        where: { id: { in: doc.rooms } },
        limit: doc.rooms.length,
      });
      if (!rooms.docs || rooms.docs.length === 0) return doc

      const rents: number[] = rooms.docs
        .map((room: Room) => room.rent)
      if (rents.length === 0) return doc

      const min = Math.min(...rents)
      const max = Math.max(...rents)

      return {
        ...doc,
        roomRentPriceRange: { min, max },
      }
    }
  }
  return doc
}

export default roomRentPriceRange
