import { Payload, PayloadRequest } from 'payload'

export async function seedSupportTickets(
  payload: Payload,
  req: PayloadRequest,
  rel?: { customerIds?: string[]; propertyIds?: string[]; userIds?: string[] },
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
    const ticketType = (['manager', 'chef', 'cleaning', 'security', 'maintenance'] as const)[i % 5]

    // Build conversation array with polymorphic senders
    const conversation =
      i % 3 === 0
        ? [
            {
              sender: {
                relationTo: 'customers' as const,
                value: customerId,
              },
              message: `Initial request for support ticket #${i}`,
              createdAt: now,
            },
            {
              sender: {
                relationTo: 'users' as const,
                value: rel?.userIds ? rel.userIds[0] : customerId,
              },
              message: `We have received your request and are working on it. Ticket #${i} is being processed.`,
              createdAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
            },
          ]
        : []

    const supportTicket = await payload.create({
      collection: 'support-tickets',
      data: {
        type: ticketType,
        customer: customerId,
        property: propertyId,
        description: `This is a test support ticket #${i} for ${ticketType} issues.`,
        status: (['open', 'in_progress', 'resolved', 'closed'] as const)[i % 4],
        createdAt: now,
        updatedAt: now,
        conversation,
      },
    })
    supportTickets.push(supportTicket)
  }
  return supportTickets
}
