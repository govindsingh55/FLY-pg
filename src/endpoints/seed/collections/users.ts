import { Payload, PayloadRequest } from 'payload'

export async function seedUsers(payload: Payload, req: PayloadRequest) {
  // Find the first registered user (earliest createdAt) to preserve for admin onboarding
  const firstUser = await payload.find({
    collection: 'users',
    sort: 'createdAt',
    limit: 1,
  })

  const firstUserId = firstUser.docs.length > 0 ? firstUser.docs[0].id : null

  // Delete all users except the first registered user and admin@example.com
  await payload.delete({
    collection: 'users',
    where: {
      and: [
        { email: { not_equals: 'admin@example.com' } },
        ...(firstUserId ? [{ id: { not_equals: firstUserId } }] : []),
      ],
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
