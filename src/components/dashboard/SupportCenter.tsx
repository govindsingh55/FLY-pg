'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Send,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

interface SupportTicket {
  id: string
  type: 'manager' | 'chef' | 'cleaning' | 'maintenance' | 'security'
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
  property?: {
    id: string
    name: string
  }
  conversation?: Array<{
    id: string
    sender: {
      id: string
      name: string
      role: string
    }
    message: string
    image?: string
    createdAt: string
  }>
}

interface CreateTicketData {
  type: 'manager' | 'chef' | 'cleaning' | 'maintenance' | 'security'
  description: string
  property?: string
}

export function SupportCenter() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [createTicketData, setCreateTicketData] = useState<CreateTicketData>({
    type: 'maintenance',
    description: '',
    property: '',
  })
  const [creatingTicket, setCreatingTicket] = useState(false)

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/custom/customers/support/tickets')
      if (!response.ok) throw new Error('Failed to fetch tickets')
      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
      toast.error('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  // Create new ticket
  const createTicket = async () => {
    if (!createTicketData.description.trim()) {
      toast.error('Please provide a description')
      return
    }

    setCreatingTicket(true)
    try {
      const response = await fetch('/api/custom/customers/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createTicketData),
      })

      if (!response.ok) throw new Error('Failed to create ticket')

      const newTicket = await response.json()
      setTickets((prev) => [newTicket.ticket, ...prev])
      setIsCreateDialogOpen(false)
      setCreateTicketData({ type: 'maintenance', description: '', property: '' })
      toast.success('Support ticket created successfully')
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('Failed to create support ticket')
    } finally {
      setCreatingTicket(false)
    }
  }

  // Send message to ticket
  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    setSendingMessage(true)
    try {
      const response = await fetch(
        `/api/custom/customers/support/tickets/${selectedTicket.id}/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMessage }),
        },
      )

      if (!response.ok) throw new Error('Failed to send message')

      const updatedTicket = await response.json()
      setSelectedTicket(updatedTicket.ticket)
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? updatedTicket.ticket : t)))
      setNewMessage('')
      toast.success('Message sent successfully')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: 'Open', variant: 'default' as const, icon: AlertCircle },
      in_progress: { label: 'In Progress', variant: 'secondary' as const, icon: Clock },
      resolved: { label: 'Resolved', variant: 'default' as const, icon: CheckCircle },
      closed: { label: 'Closed', variant: 'outline' as const, icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Get type label
  const getTypeLabel = (type: string) => {
    const typeLabels = {
      manager: 'Management',
      chef: 'Food & Chef',
      cleaning: 'Cleaning',
      maintenance: 'Maintenance',
      security: 'Security',
    }
    return typeLabels[type as keyof typeof typeLabels] || type
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Center</CardTitle>
          <CardDescription>Loading your support tickets...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">
            Get help with maintenance, food, cleaning, and other issues
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and we&apos;ll get back to you as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Issue Type</Label>
                <Select
                  value={createTicketData.type}
                  onValueChange={(value) =>
                    setCreateTicketData((prev) => ({ ...prev, type: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="chef">Food & Chef</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="manager">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your issue in detail..."
                  value={createTicketData.description}
                  onChange={(e) =>
                    setCreateTicketData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createTicket} disabled={creatingTicket}>
                  {creatingTicket ? 'Creating...' : 'Create Ticket'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Support Tickets
          </CardTitle>
          <CardDescription>
            {tickets.length === 0 ? 'No support tickets yet' : `${tickets.length} ticket(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No support tickets yet</p>
              <p className="text-sm text-muted-foreground">Create your first ticket to get help</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedTicket(ticket)
                      setIsTicketDialogOpen(true)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{getTypeLabel(ticket.type)}</Badge>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ticket.description.length > 100
                            ? `${ticket.description.substring(0, 100)}...`
                            : ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          {ticket.conversation && ticket.conversation.length > 0 && (
                            <span>{ticket.conversation.length} message(s)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant="outline">{getTypeLabel(selectedTicket.type)}</Badge>
                  {getStatusBadge(selectedTicket.status)}
                </DialogTitle>
                <DialogDescription>
                  Created on {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Original Description */}
                <div>
                  <Label className="text-sm font-medium">Issue Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTicket.description}</p>
                </div>

                <Separator />

                {/* Conversation */}
                <div>
                  <Label className="text-sm font-medium">Conversation</Label>
                  <ScrollArea className="h-[300px] mt-2">
                    <div className="space-y-3">
                      {selectedTicket.conversation && selectedTicket.conversation.length > 0 ? (
                        selectedTicket.conversation.map((message, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium">
                                {message.sender.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{message.sender.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {message.sender.role}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{message.message}</p>
                              {message.image && (
                                <div className="mt-2">
                                  <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="max-w-full h-auto rounded border"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Send Message */}
                {selectedTicket.status !== 'closed' && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="new-message">Add Message</Label>
                      <div className="flex gap-2">
                        <Textarea
                          id="new-message"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={2}
                          className="flex-1"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={sendingMessage || !newMessage.trim()}
                          size="sm"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
