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
        foodMenu: rel?.foodMenuId
          ? {
              menu: rel.foodMenuId,
              price: 1200 + i * 200, // City-specific pricing: 1200, 1400, 1600, etc.
            }
          : undefined,
        rooms: rel?.roomIds,
        // Security Deposit Configuration
        securityDepositConfig: {
          enabled: i % 2 === 0, // Enable for even-numbered properties
          amount: i % 2 === 0 ? 5000 + i * 500 : 0,
          type: i % 3 === 0 ? 'multiplier' : 'fixed',
          multiplier: i % 3 === 0 ? 2 : 2,
          refundable: true,
          refundConditions:
            i % 2 === 0
              ? 'Security deposit will be refunded within 30 days of check-out if no damages are found.'
              : '',
        },
      },
    })
    properties.push(property)
  }
  return properties
}
