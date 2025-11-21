'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface StaffUser {
  id: string
  name: string
  role: string
}

interface SupportTicket {
  id: string
  type: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  staff?: { id: string; name: string }
  customer: { id: string; name: string }
}

function StaffTicketsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')
  const [user, setUser] = useState<StaffUser | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/custom/staff/me')
        if (!userRes.ok) {
          router.push('/staff/login')
          return
        }
        const userData = await userRes.json()
        setUser(userData.user)

        // Set active tab based on filter
        if (filter === 'unassigned') {
          setActiveTab('unassigned')
        }

        const ticketsRes = await fetch('/api/custom/staff/support/tickets?limit=50')
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json()
          setTickets(ticketsData.tickets)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, filter])

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === 'unassigned') return !ticket.staff
    if (activeTab === 'mine') return ticket.staff?.id === user?.id
    if (activeTab === 'open') return ticket.status === 'open'
    if (activeTab === 'in_progress') return ticket.status === 'in_progress'
    return true
  })

  const statusBadgeClass = {
    open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 overflow-x-auto">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'all', label: 'All Tickets' },
            { key: 'unassigned', label: 'Unassigned' },
            { key: 'mine', label: 'My Tickets' },
            { key: 'open', label: 'Open' },
            { key: 'in_progress', label: 'In Progress' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/staff/tickets/${ticket.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        statusBadgeClass[ticket.status]
                      }`}
                    >
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {ticket.type}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium mb-1">
                    {ticket.description.slice(0, 100)}
                    {ticket.description.length > 100 && '...'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customer: {ticket.customer.name}
                  </p>
                </div>
                <div className="text-right ml-4">
                  {ticket.staff ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Assigned to: {ticket.staff.name}
                    </p>
                  ) : (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Unassigned
                    </span>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function StaffTicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tickets...</p>
          </div>
        </div>
      }
    >
      <StaffTicketsContent />
    </Suspense>
  )
}
