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
                children: [
                  {
                    type: 'text',
                    text: `description of menu ${i}`,
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
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
