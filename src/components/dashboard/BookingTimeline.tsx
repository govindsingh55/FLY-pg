'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  CheckCircle,
  Clock,
  Home,
  CreditCard,
  Star,
  AlertCircle,
  FileText,
  User,
  MapPin,
} from 'lucide-react'

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  status: 'completed' | 'current' | 'upcoming' | 'cancelled'
  icon: React.ComponentType<{ className?: string }>
}

interface BookingTimelineProps {
  booking: {
    id: string
    status: string
    startDate: string
    endDate: string
    checkInDate?: string
    checkOutDate?: string
    rating?: number
    review?: string
    cancellationReason?: string
    property?: {
      name: string
      location?: string
    }
    roomSnapshot?: {
      name: string
    }
  }
}

export function BookingTimeline({ booking }: BookingTimelineProps) {
  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        id: '1',
        title: 'Booking Confirmed',
        description: 'Your booking has been confirmed and payment processed',
        date: new Date(booking.startDate).toLocaleDateString(),
        status: 'completed',
        icon: CheckCircle,
      },
      {
        id: '2',
        title: 'Check-in',
        description: `Check-in at ${booking.property?.name || 'Property'}`,
        date: booking.checkInDate
          ? new Date(booking.checkInDate).toLocaleDateString()
          : new Date(booking.startDate).toLocaleDateString(),
        status: booking.checkInDate ? 'completed' : 'current',
        icon: Home,
      },
      {
        id: '3',
        title: 'Stay Period',
        description: `Enjoy your stay at ${booking.property?.name || 'Property'}`,
        date: `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`,
        status: booking.status === 'cancelled' ? 'cancelled' : 'current',
        icon: Calendar,
      },
      {
        id: '4',
        title: 'Check-out',
        description: 'Check-out from the property',
        date: booking.checkOutDate
          ? new Date(booking.checkOutDate).toLocaleDateString()
          : new Date(booking.endDate).toLocaleDateString(),
        status: booking.checkOutDate ? 'completed' : 'upcoming',
        icon: User,
      },
      {
        id: '5',
        title: 'Review & Rating',
        description: 'Share your experience and rate the property',
        date: booking.rating ? 'Completed' : 'Pending',
        status: booking.rating ? 'completed' : 'upcoming',
        icon: Star,
      },
    ]

    // Add cancellation event if booking is cancelled
    if (booking.status === 'cancelled') {
      events.push({
        id: '6',
        title: 'Booking Cancelled',
        description: booking.cancellationReason || 'Booking was cancelled',
        date: 'Cancelled',
        status: 'cancelled',
        icon: AlertCircle,
      })
    }

    return events
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'current':
        return 'bg-blue-100 text-blue-800'
      case 'upcoming':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getIconColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'current':
        return 'text-blue-600'
      case 'upcoming':
        return 'text-gray-400'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-gray-400'
    }
  }

  const timelineEvents = getTimelineEvents()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Booking Timeline
        </CardTitle>
        <CardDescription>
          Track the progress of your booking from confirmation to completion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Property</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {booking.property?.name || 'Property Name'}
              </p>
              {booking.property?.location && (
                <p className="text-xs text-muted-foreground">{booking.property.location}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Room</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {booking.roomSnapshot?.name || 'Room Details'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="relative">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon
              return (
                <div key={event.id} className="relative pb-8">
                  {/* Timeline line */}
                  {index < timelineEvents.length - 1 && (
                    <div className="absolute left-6 top-6 h-full w-0.5 bg-gray-200" />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${getStatusColor(event.status)}`}
                    >
                      <Icon className={`h-6 w-6 ${getIconColor(event.status)}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge
                          variant={event.status === 'completed' ? 'default' : 'secondary'}
                          className={getStatusColor(event.status)}
                        >
                          {event.status === 'completed' && 'Completed'}
                          {event.status === 'current' && 'Current'}
                          {event.status === 'upcoming' && 'Upcoming'}
                          {event.status === 'cancelled' && 'Cancelled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Additional Information */}
          {booking.rating && (
            <div className="mt-6 rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Review Submitted</span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < (booking.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-green-700">{booking.rating}/5 stars</span>
              </div>
              {booking.review && (
                <p className="mt-2 text-sm text-green-700">&quot;{booking.review}&quot;</p>
              )}
            </div>
          )}

          {booking.status === 'cancelled' && booking.cancellationReason && (
            <div className="mt-6 rounded-lg bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Cancellation Reason</span>
              </div>
              <p className="mt-2 text-sm text-red-700">{booking.cancellationReason}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
