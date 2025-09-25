'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, CreditCard, Clock, Star } from 'lucide-react'
import Link from 'next/link'

interface BookingCardProps {
  booking: {
    id: string
    status: string
    price: number
    periodInMonths: number
    foodIncluded: boolean
    createdAt: string
    property?: {
      id: string
      name: string
      location?: string
      images?: Array<{
        id: string
        url: string
        alt?: string
      }>
    }
    room?: {
      id: string
      name: string
      type?: string
    }
    roomSnapshot?: {
      name: string
      type?: string
      price?: number
    }
  }
  showActions?: boolean
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return '✓'
    case 'pending':
      return '⏳'
    case 'cancelled':
      return '✕'
    case 'completed':
      return '✓'
    default:
      return '•'
  }
}

export function BookingCard({ booking, showActions = true }: BookingCardProps) {
  const roomName = booking.room?.name || booking.roomSnapshot?.name || 'Room'
  const roomType = booking.room?.type || booking.roomSnapshot?.type || 'Standard'
  const propertyName = booking.property?.name || 'Property'
  const propertyLocation = booking.property?.location || 'Location not specified'
  const roomPrice = booking.roomSnapshot?.price || booking.price

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{propertyName}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {propertyLocation}
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(booking.status)} border`}>
            <span className="mr-1">{getStatusIcon(booking.status)}</span>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Room details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Room</p>
            <p className="text-sm">{roomName}</p>
            <p className="text-xs text-muted-foreground">{roomType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Duration</p>
            <p className="text-sm">
              {booking.periodInMonths} month{booking.periodInMonths !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Price and amenities */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Price</p>
            <p className="text-lg font-semibold">₹{roomPrice?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Amenities</p>
            <div className="flex items-center space-x-2">
              {booking.foodIncluded && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Food Included
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Booking date */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Button variant="outline" size="lg" asChild>
              <Link href={`/dashboard/bookings/${booking.id}`}>
                <Clock className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>

            {booking.status === 'confirmed' && (
              <Button variant="outline" size="lg" asChild>
                <Link href={`/dashboard/rent?booking=${booking.id}`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Rent
                </Link>
              </Button>
            )}

            {booking.status === 'completed' && (
              <Button variant="outline" size="lg">
                <Star className="mr-2 h-4 w-4" />
                Rate & Review
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
