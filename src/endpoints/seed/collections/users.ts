import { Payload, PayloadRequest } from 'payload'

export async function seedUsers(payload: Payload, req: PayloadRequest) {
  await payload.delete({
    collection: 'users',
    where: {
      email: { not_equals: 'admin@example.com' },
    },
  })
  const users = []
  for (let i = 1; i <= 12; i++) {
    const user = await payload.create({
      collection: 'users',
      data: {
        role: 'admin',
        email: `admin${i}@example.com`,
        password: 'password123',
      },
    })
    users.push(user)
  }
  return users
}
