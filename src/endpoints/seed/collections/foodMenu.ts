import { Payload, PayloadRequest } from 'payload'

export async function seedFoodMenu(payload: Payload, req: PayloadRequest) {
  await payload.delete({
    collection: 'food-menu',
    where: {},
  })
  const foodMenus = []
  for (let i = 1; i <= 12; i++) {
    const foodMenu = await payload.create({
      collection: 'food-menu',
      data: {
        name: `Menu ${i}`,
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ text: `Description for Menu ${i}` }],
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    })
    foodMenus.push(foodMenu)
  }
  return foodMenus
}
