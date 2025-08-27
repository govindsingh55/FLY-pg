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
        type: (['manager', 'chef', 'cleaning', 'security'] as const)[i % 4],
        customer: customerId,
        property: propertyId,
        description: `This is a test support ticket #${i} for ${['management', 'food', 'cleaning', 'security'][i % 4]} issues.`,
        status: (['open', 'in_progress', 'resolved', 'closed'] as const)[i % 4],
        createdAt: now,
        updatedAt: now,
        conversation:
          i % 3 === 0
            ? [
                {
                  sender: customerId,
                  message: `Initial request for support ticket #${i}`,
                  createdAt: now,
                },
                {
                  sender: rel?.customerIds ? rel.customerIds[0] : customerId, // Simulate staff response
                  message: `We have received your request and are working on it. Ticket #${i} is being processed.`,
                  createdAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
                },
              ]
            : [],
      },
    })
    supportTickets.push(supportTicket)
  }
  return supportTickets
}
