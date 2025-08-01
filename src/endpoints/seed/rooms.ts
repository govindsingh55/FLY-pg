// Seed data for Rooms collection
const roomsSeed = [
  {
    name: 'Room 101',
    property: '', // to be filled with seeded property id
    type: 'single', // custom field
    status: 'active' as 'active', // enum: 'active' | 'inactive' | null | undefined
    roomType: 'single' as 'single', // enum
    rent: 10000,
  },
  {
    name: 'Room 102',
    property: '',
    type: 'double',
    status: 'active' as 'active',
    roomType: 'two_sharing' as 'two_sharing',
    rent: 15000,
  },
]
export default roomsSeed
