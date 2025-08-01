// Seed data for VisitBookings collection
type VisitBookingStatus = 'pending' | 'confirmed' | 'cancelled'

interface VisitBookingSeed {
  customer: string
  property: string
  visitDate: string
  status: VisitBookingStatus
}

const visitBookingsSeed: VisitBookingSeed[] = [
  {
    customer: 'customer-id-1',
    property: 'property-id-1',
    visitDate: '2025-08-05',
    status: 'pending',
  },
  {
    customer: 'customer-id-2',
    property: 'property-id-2',
    visitDate: '2025-08-10',
    status: 'confirmed',
  },
]
export default visitBookingsSeed
