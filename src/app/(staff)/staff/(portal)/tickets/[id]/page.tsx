'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'

export const dynamic = 'force-dynamic'

interface StaffUser {
  id: string
  name: string
  role: string
}

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
}

interface ConversationEntry {
  message: string
  timestamp: string
  sender: {
    relationTo: 'users' | 'customers'
    value: { id: string; name: string; role?: string }
  }
}

interface ProgressEntry {
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  updatedBy: {
    relationTo: 'users' | 'customers'
    value: { id: string; name: string; role?: string }
  }
  note?: string
  updatedAt: string
}

interface SupportTicket {
  id: string
  type: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  staff?: { id: string; name: string; role: string }
  customer: { id: string; name: string }
  conversation: ConversationEntry[]
  progress?: ProgressEntry[]
  property?: { id: string; name: string }
}

export default function StaffTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<StaffUser | null>(null)
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showReassignDialog, setShowReassignDialog] = useState(false)
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [reassignNote, setReassignNote] = useState('')
  const [showProgressTimeline, setShowProgressTimeline] = useState(false)

  const fetchTicket = useCallback(async () => {
    try {
      const userRes = await fetch('/api/custom/staff/me')
      if (!userRes.ok) {
        router.push('/staff/login')
        return
      }
      const userData = await userRes.json()
      setUser(userData.user)

      const ticketRes = await fetch(`/api/custom/staff/support/tickets/${id}`)
      if (ticketRes.ok) {
        const ticketData = await ticketRes.json()
        setTicket(ticketData.ticket)
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  // Fetch staff list for managers/admins
  const fetchStaffList = useCallback(async () => {
    if (!user || (user.role !== 'manager' && user.role !== 'admin')) return

    try {
      const res = await fetch('/api/custom/staff/users')
      if (res.ok) {
        const data = await res.json()
        setStaffList(data.staff || [])
      }
    } catch (error) {
      console.error('Failed to fetch staff list:', error)
    }
  }, [user])

  useEffect(() => {
    if (user && (user.role === 'manager' || user.role === 'admin')) {
      fetchStaffList()
    }
  }, [user, fetchStaffList])

  const handleAssign = async (action: 'claim' | 'unassign') => {
    if (!user) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/custom/staff/support/tickets/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        await fetchTicket()
      }
    } catch (error) {
      console.error('Failed to assign ticket:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/custom/staff/support/tickets/${id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })
      if (res.ok) {
        setMessage('')
        await fetchTicket()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReassign = async () => {
    if (!user || (user.role !== 'manager' && user.role !== 'admin')) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/custom/staff/support/tickets/${id}/reassign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedStaffId || null,
          note: reassignNote || undefined,
        }),
      })
      if (res.ok) {
        setShowReassignDialog(false)
        setSelectedStaffId('')
        setReassignNote('')
        await fetchTicket()
      }
    } catch (error) {
      console.error('Failed to reassign ticket:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!user) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/custom/staff/support/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        await fetchTicket()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setSubmitting(false)
    }
  }

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

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Ticket not found</p>
          <Link href="/staff/tickets" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Tickets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            href="/staff/tickets"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ticket Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          {user?.role === 'manager' || user?.role === 'admin' ? (
            <button
              onClick={() => setShowReassignDialog(true)}
              disabled={submitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
            >
              Reassign
            </button>
          ) : null}
          {!ticket.staff ? (
            <button
              onClick={() => handleAssign('claim')}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Claim Ticket
            </button>
          ) : ticket.staff.id === user?.id ? (
            <button
              onClick={() => handleAssign('unassign')}
              disabled={submitting}
              className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-sm"
            >
              Unassign
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <div className="flex flex-col space-y-2">
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded w-fit ${
                    statusBadgeClass[ticket.status]
                  }`}
                >
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </span>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {ticket.status === 'open' && (
                    <button
                      onClick={() => handleStatusUpdate('in_progress')}
                      disabled={submitting}
                      className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {ticket.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusUpdate('resolved')}
                      disabled={submitting}
                      className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {(ticket.status === 'resolved' || ticket.status === 'in_progress') &&
                    (user?.role === 'manager' || user?.role === 'admin') && (
                      <button
                        onClick={() => handleStatusUpdate('closed')}
                        disabled={submitting}
                        className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Close Ticket
                      </button>
                    )}

                  {ticket.status === 'closed' &&
                    (user?.role === 'manager' || user?.role === 'admin') && (
                      <button
                        onClick={() => handleStatusUpdate('open')}
                        disabled={submitting}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                      >
                        Reopen
                      </button>
                    )}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type</p>
              <p className="text-gray-900 dark:text-white capitalize">{ticket.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer</p>
              <p className="text-gray-900 dark:text-white">{ticket.customer.name}</p>
            </div>
            {ticket.property && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Property</p>
                <p className="text-gray-900 dark:text-white">{ticket.property.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assigned To</p>
              <p className="text-gray-900 dark:text-white">
                {ticket.staff ? ticket.staff.name : 'Unassigned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</p>
              <p className="text-gray-900 dark:text-white text-sm">
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Progress History Section */}
            {(user?.role === 'manager' || user?.role === 'admin') &&
              ticket.progress &&
              ticket.progress.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowProgressTimeline(!showProgressTimeline)}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span>Progress History ({ticket.progress.length})</span>
                    <span className="text-xs">{showProgressTimeline ? '▼' : '▶'}</span>
                  </button>

                  {showProgressTimeline && (
                    <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
                      {ticket.progress
                        .slice()
                        .reverse()
                        .map((entry, idx) => {
                          const updatedByData =
                            typeof entry.updatedBy === 'object' && 'value' in entry.updatedBy
                              ? entry.updatedBy.value
                              : null
                          const updatedByName =
                            typeof updatedByData === 'object' &&
                            updatedByData &&
                            'name' in updatedByData
                              ? updatedByData.name
                              : 'Unknown'
                          const updatedByRole =
                            typeof updatedByData === 'object' &&
                            updatedByData &&
                            'role' in updatedByData
                              ? updatedByData.role
                              : 'user'

                          return (
                            <div
                              key={idx}
                              className="relative pl-6 pb-3 border-l-2 border-gray-300 dark:border-gray-600 last:border-l-0 last:pb-0"
                            >
                              <div className="absolute left-0 top-0 -ml-1.5 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(entry.updatedAt).toLocaleString()}
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                Status: {entry.status.replace('_', ' ').toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                By: {updatedByName}{' '}
                                <span className="text-gray-500">({updatedByRole})</span>
                              </div>
                              {entry.note && (
                                <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                  {entry.note}
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {ticket.description}
              </h2>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {ticket.conversation.map((entry, idx) => {
                const isStaff = entry.sender.relationTo === 'users'
                const isCurrentUser = isStaff && entry.sender.value.id === user?.id

                return (
                  <div
                    key={idx}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : isStaff
                            ? 'bg-purple-100 dark:bg-purple-900/20'
                            : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isCurrentUser ? 'text-blue-100' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {entry.sender.value.name}
                        </span>
                        {isStaff && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              isCurrentUser
                                ? 'bg-blue-500 text-white'
                                : 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
                            }`}
                          >
                            Staff
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          isCurrentUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {entry.message}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage}>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Reassignment Dialog */}
      {showReassignDialog && (user?.role === 'manager' || user?.role === 'admin') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reassign Ticket
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign To
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Unassign (No staff)</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                  placeholder="Add a note about this reassignment..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowReassignDialog(false)
                    setSelectedStaffId('')
                    setReassignNote('')
                  }}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassign}
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? 'Reassigning...' : 'Reassign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
