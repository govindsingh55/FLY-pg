import { Payload, PayloadRequest } from 'payload'

export async function seedBookings(
  payload: Payload,
  req: PayloadRequest,
  rel?: { propertyId?: string; customerId?: string; roomId?: string },
) {
  await payload.delete({
    collection: 'bookings',
    where: {},
  })
  const bookings = []
  for (let i = 1; i <= 12; i++) {
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        property: rel?.propertyId || 'mock-property-id',
        customer: rel?.customerId || 'mock-customer-id',
        room: rel?.roomId || 'mock-room-id',
        price: 1000 + i * 50,
        status: 'confirmed',
      },
    })
    bookings.push(booking)
  }
  return bookings
}
