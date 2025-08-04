import { Property } from '@/payload-types'

// Seed data for Properties collection
const propertiesSeed: Array<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>> = [
  {
    name: 'Sunrise Apartments',
    slug: 'sunrise-apartments',
    preview: false,
    meta: {
      title: 'Sunrise Apartments - Bangalore',
      description: 'A beautiful apartment in the city center of Bangalore.',
      image: '', // Add media ID if available
    },
    address: {
      address: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [{ text: '123 Main St', type: 'text', version: 1 }],
            },
          ],
          direction: 'ltr' as 'ltr',
          format: '' as '',
          indent: 0,
          version: 1,
        },
      },
      location: {
        state: 'Karnataka',
        city: 'Bangalore',
        sector: 'Sector 1',
        coordinates: [77.5946, 12.9716] as [number, number],
        mapLink: 'https://maps.example.com/sunrise-apartments',
      },
    },
    propertyType: 'Apartment',
    genderType: 'Unisex',
    manager: 'manager-id-1',
    featured: true,
    amenities: ['AC', 'CCTV'],
    images: [
      {
        image: 'media-id-1', // Replace with actual media ID
        isCover: true,
      },
    ],
    foodMenu: undefined,
    nearbyLocations: [{ name: 'Metro Station', distance: '500m' }],
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              { text: 'A beautiful apartment in the city center.', type: 'text', version: 1 },
            ],
          },
        ],
        direction: 'ltr' as 'ltr',
        format: '' as '',
        indent: 0,
        version: 1,
      },
    },
    rooms: [],
    roomRentPriceRange: { min: 0, max: 0 },
  },
  {
    name: 'Green Villa',
    slug: 'green-villa',
    preview: true, // Enable for live preview testing
    meta: {
      title: 'Green Villa - New Delhi',
      description: 'Spacious villa with all amenities in New Delhi.',
      image: 'media-id-2', // Replace with actual media ID
    },
    address: {
      address: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [{ text: '456 Park Ave', type: 'text', version: 1 }],
            },
          ],
          direction: 'ltr' as 'ltr',
          format: '' as '',
          indent: 0,
          version: 1,
        },
      },
      location: {
        state: 'Delhi',
        city: 'New Delhi',
        sector: 'Sector 2',
        coordinates: [77.1025, 28.7041] as [number, number],
        mapLink: 'https://maps.example.com/green-villa',
      },
    },
    propertyType: 'PG',
    genderType: 'Male',
    manager: 'manager-id-2',
    featured: false,
    amenities: ['Power Backup', 'House Keeping'],
    images: [
      {
        image: 'media-id-2', // Replace with actual media ID
        isCover: true,
      },
    ],
    foodMenu: undefined,
    nearbyLocations: [{ name: 'Bus Stop', distance: '200m' }],
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [{ text: 'Spacious villa with all amenities.', type: 'text', version: 1 }],
          },
        ],
        direction: 'ltr' as 'ltr',
        format: '' as '',
        indent: 0,
        version: 1,
      },
    },
    rooms: [],
    roomRentPriceRange: { min: 0, max: 0 },
  },
]
export default propertiesSeed
