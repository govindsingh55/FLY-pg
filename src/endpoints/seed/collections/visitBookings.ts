import { Payload, PayloadRequest } from 'payload'

export async function seedVisitBookings(
  payload: Payload,
  req: PayloadRequest,
  rel?: { propertyId?: string; customerId?: string },
) {
  await payload.delete({
    collection: 'visit-bookings',
    where: {},
  })
  const visitBookings = []
  for (let i = 1; i <= 12; i++) {
    const visitBooking = await payload.create({
      collection: 'visit-bookings',
      data: {
        property: rel?.propertyId || 'mock-property-id',
        customer: rel?.customerId || 'mock-customer-id',
        visitDate: new Date(Date.now() + 86400000 * i).toISOString(),
        status: 'pending',
      },
    })
    visitBookings.push(visitBooking)
  }
  return visitBookings
}
