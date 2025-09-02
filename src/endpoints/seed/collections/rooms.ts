import { Payload, PayloadRequest } from 'payload'

export async function seedRooms(payload: Payload, req: PayloadRequest, amenityIds?: string[]) {
  await payload.delete({
    collection: 'rooms',
    where: {},
  })

  // Get some amenity IDs to use for rooms
  let roomAmenityIds: string[] = []
  if (amenityIds && amenityIds.length > 0) {
    roomAmenityIds = amenityIds.slice(0, 3) // Use first 3 amenities for rooms
  } else {
    // Fallback: get first few amenities from the collection
    try {
      const amenitiesResponse = await payload.find({
        collection: 'amenities',
        where: { status: { equals: 'active' } },
        limit: 3,
      })
      roomAmenityIds = amenitiesResponse.docs.map((a: any) => a.id)
    } catch (error) {
      console.warn('Could not fetch amenities for rooms, using empty array', error)
      roomAmenityIds = []
    }
  }

  const rooms = []
  for (let i = 1; i <= 12; i++) {
    const room = await payload.create({
      collection: 'rooms',
      data: {
        name: `Room ${i}`,
        roomType: 'single',
        rent: 5000 + i * 100,
        amenities: roomAmenityIds.length > 0 ? roomAmenityIds.slice(0, 2) : [],
      },
    })
    rooms.push(room)
  }
  return rooms
}
