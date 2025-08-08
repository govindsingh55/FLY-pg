import { Payload, PayloadRequest } from 'payload'

export async function seedRooms(payload: Payload, req: PayloadRequest) {
  await payload.delete({
    collection: 'rooms',
    where: {},
  })
  const rooms = []
  for (let i = 1; i <= 12; i++) {
    const room = await payload.create({
      collection: 'rooms',
      data: {
        name: `Room ${i}`,
        roomType: 'single',
        rent: 5000 + i * 100,
        amenities: [{ amenity: 'AC' }, { amenity: 'Bed Sheet' }],
      },
    })
    rooms.push(room)
  }
  return rooms
}
