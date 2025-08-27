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
        foodIncluded: i % 2 === 0,
        startDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(), // Start dates spread out
        endDate: new Date(Date.now() + (i + 6) * 24 * 60 * 60 * 1000).toISOString(), // 6 months duration
        // Security Deposit Fields
        securityDeposit: {
          amount: i % 2 === 0 ? 2000 + i * 200 : 0,
          status: i % 2 === 0 ? (i % 3 === 0 ? 'paid' : 'pending') : 'not-required',
          paidDate: i % 2 === 0 && i % 3 === 0 ? new Date().toISOString() : undefined,
          refundedDate: undefined,
          refundAmount: undefined,
          notes: i % 2 === 0 ? `Security deposit for booking ${i}` : '',
        },
      },
    })
    bookings.push(booking)
  }
  return bookings
}
