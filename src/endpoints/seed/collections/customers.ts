import { Payload, PayloadRequest } from 'payload'

export async function seedCustomers(payload: Payload, _req: PayloadRequest) {
  await payload.delete({
    collection: 'customers',
    where: {},
  })
  const customers = []
  for (let i = 1; i <= 12; i++) {
    const customer = await payload.create({
      collection: 'customers',
      data: {
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        phone: `9876543${i.toString().padStart(3, '0')}`,
        password: `password${i}`,
        // Skip email verification during development seeding
        ...(process.env.NODE_ENV === 'development' && { _verified: true }),
      },
    })
    customers.push(customer)
  }
  return customers
}
