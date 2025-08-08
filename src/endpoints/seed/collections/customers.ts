import { Payload, PayloadRequest } from 'payload'

export async function seedCustomers(payload: Payload, req: PayloadRequest) {
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
        phone: `12345678${i.toString().padStart(2, '0')}`,
        password: `password${i}`,
      },
    })
    customers.push(customer)
  }
  return customers
}
