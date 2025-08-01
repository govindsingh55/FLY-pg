// Seed data for SupportTickets collection
type SupportTicketType = 'cleaning' | 'manager' | 'chef' | 'security'
type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

interface SupportTicketSeed {
  status: SupportTicketStatus
  type: SupportTicketType
  description: string
}

const supportTicketsSeed: SupportTicketSeed[] = [
  {
    status: 'open',
    type: 'manager',
    description: 'WiFi not working in room',
  },
  {
    status: 'open',
    type: 'cleaning',
    description: 'Room not cleaned for 2 days',
  },
]
export default supportTicketsSeed
