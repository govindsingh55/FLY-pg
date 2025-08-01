// Seed data for Bookings collection
type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

interface BookingSeed {
  customer: string
  property: string
  room: string
  startDate: string
  endDate: string
  status: BookingStatus
  price: number
  periodInMonths: number
}

const bookingsSeed: BookingSeed[] = [
  {
    customer: 'customer-id-1',
    property: 'property-id-1',
    room: 'room-id-1',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    status: 'confirmed',
    price: 10000,
    periodInMonths: 1,
  },
  {
    customer: 'customer-id-2',
    property: 'property-id-2',
    room: 'room-id-2',
    startDate: '2025-09-01',
    endDate: '2025-09-15',
    status: 'pending',
    price: 15000,
    periodInMonths: 0.5,
  },
]
export default bookingsSeed
