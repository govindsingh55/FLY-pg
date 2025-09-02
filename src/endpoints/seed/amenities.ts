import type { Payload } from 'payload'

export const seedAmenities = async (payload: Payload) => {
  console.log('🌱 Seeding amenities...')

  const amenitiesData: Array<{
    name: string
    description: string
    iconName: string
    status: 'active' | 'draft' | 'deleted'
  }> = [
    {
      name: 'WiFi',
      description: 'High-speed wireless internet access throughout the property',
      iconName: 'Wifi',
      status: 'active',
    },
    {
      name: 'Laundry',
      description: 'Washing and drying facilities for residents',
      iconName: 'Shirt',
      status: 'active',
    },
    {
      name: 'Meals',
      description: 'Daily meals included in rent',
      iconName: 'Utensils',
      status: 'active',
    },
    {
      name: 'Housekeeping',
      description: 'Regular cleaning and maintenance services',
      iconName: 'Broom',
      status: 'active',
    },
    {
      name: 'Security',
      description: '24x7 security personnel and surveillance',
      iconName: 'ShieldCheck',
      status: 'active',
    },
    {
      name: 'Air Conditioning',
      description: 'Climate control in all rooms',
      iconName: 'Snowflake',
      status: 'active',
    },
    {
      name: 'Parking',
      description: 'Secure parking space for residents',
      iconName: 'ParkingCircle',
      status: 'active',
    },
    {
      name: 'Gym',
      description: 'Fitness center with modern equipment',
      iconName: 'Dumbbell',
      status: 'active',
    },
    {
      name: 'Study Area',
      description: 'Quiet study spaces for students',
      iconName: 'BookOpen',
      status: 'active',
    },
    {
      name: 'Community Events',
      description: 'Regular social activities and events',
      iconName: 'PartyPopper',
      status: 'active',
    },
    {
      name: 'Bed Sheet',
      description: 'Fresh bed linens provided',
      iconName: 'Bed',
      status: 'active',
    },
    {
      name: 'Pillow',
      description: 'Comfortable pillows included',
      iconName: 'Bed',
      status: 'active',
    },
    {
      name: 'Refrigerator',
      description: 'Personal refrigerator in each room',
      iconName: 'Refrigerator',
      status: 'active',
    },
    {
      name: 'Power Backup',
      description: 'Uninterrupted power supply',
      iconName: 'Zap',
      status: 'active',
    },
    {
      name: 'CCTV',
      description: 'Closed-circuit television surveillance',
      iconName: 'Video',
      status: 'active',
    },
    {
      name: 'Reception',
      description: '24x7 front desk assistance',
      iconName: 'Building',
      status: 'active',
    },
    {
      name: 'Drinking Water',
      description: 'Clean drinking water available',
      iconName: 'Droplets',
      status: 'active',
    },
    {
      name: 'Almira',
      description: 'Storage wardrobe in each room',
      iconName: 'Package',
      status: 'active',
    },
    {
      name: 'Bathroom',
      description: 'Private or shared bathroom facilities',
      iconName: 'Bath',
      status: 'active',
    },
  ]

  const createdAmenities: any[] = []

  for (const amenityData of amenitiesData) {
    try {
      // Check if amenity already exists
      const existingAmenity = await payload.find({
        collection: 'amenities',
        where: {
          name: { equals: amenityData.name },
        },
        limit: 1,
      })

      if (existingAmenity.docs.length === 0) {
        const newAmenity = await payload.create({
          collection: 'amenities',
          data: amenityData,
        })
        createdAmenities.push(newAmenity)
        console.log(`✅ Created amenity: ${amenityData.name}`)
      } else {
        createdAmenities.push(existingAmenity.docs[0])
        console.log(`⏭️  Amenity already exists: ${amenityData.name}`)
      }
    } catch (error) {
      console.error(`❌ Error creating amenity ${amenityData.name}:`, error)
    }
  }

  console.log('✅ Amenities seeding completed!')
  return createdAmenities
}
