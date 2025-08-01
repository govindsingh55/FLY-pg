// Seed data for Properties collection
const propertiesSeed = [
  {
    name: 'Sunrise Apartments',
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
    status: 'active' as 'active',
    location: {
      state: 'Karnataka',
      city: 'Bangalore',
      sector: 'Sector 1',
      coordinates: [77.5946, 12.9716] as [number, number],
      mapLink: 'https://maps.example.com/sunrise-apartments',
    },
    propertyType: 'Apartment' as 'Apartment',
    genderType: 'Unisex' as 'Unisex',
    manager: 'manager-id-1', // placeholder, update after seeding users
    featured: true,
    amenities: [{ amenity: 'AC' as 'AC' }, { amenity: 'CCTV' as 'CCTV' }],
    images: [],
    foodMenu: {
      root: {
        type: 'root',
        children: [],
        direction: 'ltr' as 'ltr',
        format: '' as '',
        indent: 0,
        version: 1,
      },
    },
    nearbyLocations: [{ name: 'Metro Station', distance: '500m' }],
    relatedProperties: [],
    rooms: [],
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
  },
  {
    name: 'Green Villa',
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
    status: 'active' as 'active',
    location: {
      state: 'Delhi',
      city: 'New Delhi',
      sector: 'Sector 2',
      coordinates: [77.1025, 28.7041] as [number, number],
      mapLink: 'https://maps.example.com/green-villa',
    },
    propertyType: 'PG' as 'PG',
    genderType: 'Male' as 'Male',
    manager: 'manager-id-2',
    featured: false,
    amenities: [
      { amenity: 'Power Backup' as 'Power Backup' },
      { amenity: 'House Keeping' as 'House Keeping' },
    ],
    images: [],
    foodMenu: {
      root: {
        type: 'root',
        children: [],
        direction: 'ltr' as 'ltr',
        format: '' as '',
        indent: 0,
        version: 1,
      },
    },
    nearbyLocations: [{ name: 'Bus Stop', distance: '200m' }],
    relatedProperties: [],
    rooms: [],
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
  },
]
export default propertiesSeed
