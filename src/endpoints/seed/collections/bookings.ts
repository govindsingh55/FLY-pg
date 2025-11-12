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
        roomRent: 1000 + i * 50,
        foodPrice: i % 2 === 0 ? 200 : 0,
        total: (1000 + i * 50) * 6 + (i % 2 === 0 ? 200 * 6 : 0), // Total for 6 months
        status: 'confirmed',
        foodIncluded: i % 2 === 0,
        periodInMonths: 6,
        startDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(), // Start dates spread out
        endDate: new Date(Date.now() + (i + 6) * 24 * 60 * 60 * 1000).toISOString(), // 6 months duration
        securityDeposit: i % 2 === 0 ? 2000 + i * 200 : 0,
      },
    })
    bookings.push(booking)
  }
  return bookings
}
