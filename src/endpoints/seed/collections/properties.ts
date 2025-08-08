import { Payload, PayloadRequest } from 'payload'

export async function seedProperties(
  payload: Payload,
  req: PayloadRequest,
  rel?: {
    foodMenuId?: string
    roomIds?: string[]
    managerId?: string
  },
) {
  await payload.delete({
    collection: 'properties',
    where: {},
  })
  const properties = []
  for (let i = 1; i <= 12; i++) {
    const property = await payload.create({
      collection: 'properties',
      data: {
        name: `Mock Property ${i}`,
        slug: `mock-property-${i}`,
        address: {
          address: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: `Address for Mock Property ${i}`,
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
          location: {
            state: 'State',
            city: 'City',
            coordinates: [0, 0],
            mapLink: 'https://maps.example.com',
          },
        },
        propertyType: 'Apartment',
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: '',
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
        amenities: ['WiFi', 'Parking'],
        manager: rel?.managerId || 'mock-manager-id',
        genderType: 'Male',
        foodMenu: rel?.foodMenuId,
        rooms: rel?.roomIds,
      },
    })
    properties.push(property)
  }
  return properties
}
