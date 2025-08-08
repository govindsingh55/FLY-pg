import { Payload, PayloadRequest } from 'payload'

export async function seedSupportTickets(
  payload: Payload,
  req: PayloadRequest,
  rel?: { customerIds?: string[]; propertyIds?: string[] },
) {
  await payload.delete({
    collection: 'support-tickets',
    where: {},
  })
  const supportTickets = []
  for (let i = 1; i <= 12; i++) {
    const customerId = rel?.customerIds
      ? rel.customerIds[i % rel.customerIds.length]
      : 'mock-customer-id'
    const now = new Date().toISOString()
    const propertyId = rel?.propertyIds ? rel.propertyIds[i % rel.propertyIds.length] : undefined
    const supportTicket = await payload.create({
      collection: 'support-tickets',
      data: {
        type: 'manager',
        customer: customerId,
        property: propertyId,
        description: `This is a test support ticket #${i}.`,
        status: 'open',
        createdAt: now,
        updatedAt: now,
      },
    })
    supportTickets.push(supportTicket)
  }
  return supportTickets
}
