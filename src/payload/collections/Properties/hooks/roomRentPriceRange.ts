import { CollectionBeforeChangeHook, type CollectionAfterChangeHook } from 'payload'
import type { Property, Room } from '@/payload/payload-types'
const roomRentPriceRange: CollectionBeforeChangeHook<Property> = async ({
  data,
  req,
  operation,
}) => {
  if (operation === 'update' || operation === 'create') {
    if (data.rooms && Array.isArray(data.rooms) && data.rooms?.length > 0) {
      const roomIds = data.rooms.map((room: any) =>
        typeof room === 'object' ? room._id || room.id : room,
      )
      const rooms = await req.payload.find({
        collection: 'rooms',
        where: { id: { in: roomIds } },
        limit: roomIds.length,
      })
      if (!rooms.docs || rooms.docs.length === 0) return data

      const rents: number[] = rooms.docs.map((room: Room) => room.rent)
      if (rents.length === 0) return data

      const min = Math.min(...rents)
      const max = Math.max(...rents)

      return {
        ...data,
        roomRentPriceRange: { min, max },
      }
    }
  }
  return data
}

export default roomRentPriceRange
