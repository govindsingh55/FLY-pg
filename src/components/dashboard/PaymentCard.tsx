'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, CreditCard, Download, Eye, Clock } from 'lucide-react'
import Link from 'next/link'

interface PaymentCardProps {
  payment: {
    id: string
    amount: number
    status: string
    paymentDate: string
    dueDate?: string
    paymentForMonthAndYear?: string
    payfor?: {
      id: string
      property?: {
        name: string
        location?: string
      }
      roomSnapshot?: {
        name: string
      }
    }
    bookingSnapshot?: {
      propertyName?: string
      roomName?: string
    }
  }
  showActions?: boolean
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return '✓'
    case 'pending':
      return '⏳'
    case 'failed':
      return '✕'
    case 'cancelled':
      return '⊘'
    default:
      return '•'
  }
}

export function PaymentCard({ payment, showActions = true }: PaymentCardProps) {
  const propertyName =
    payment.payfor?.property?.name || payment.bookingSnapshot?.propertyName || 'Property'
  const roomName = payment.payfor?.roomSnapshot?.name || payment.bookingSnapshot?.roomName || 'Room'
  const propertyLocation = payment.payfor?.property?.location || 'Location not specified'

  const isOverdue =
    payment.dueDate && new Date(payment.dueDate) < new Date() && payment.status === 'pending'

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 bg-red-50/50' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{propertyName}</CardTitle>
            <CardDescription className="mt-1">
              {roomName} • {payment.paymentForMonthAndYear || 'Rent Payment'}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={`${getStatusColor(payment.status)} border`}>
              <span className="mr-1">{getStatusIcon(payment.status)}</span>
              {payment.status}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount and dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold">₹{payment.amount?.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
            <p className="text-sm">
              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Due date and location */}
        <div className="grid grid-cols-2 gap-4">
          {payment.dueDate && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Due Date</p>
              <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                {new Date(payment.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Location</p>
            <p className="text-sm text-muted-foreground">{propertyLocation}</p>
          </div>
        </div>

        {/* Payment month */}
        {payment.paymentForMonthAndYear && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Payment for {payment.paymentForMonthAndYear}</span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/rent/payments/${payment.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>

            {payment.status === 'completed' && (
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
            )}

            {payment.status === 'pending' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/rent?payment=${payment.id}`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Link>
              </Button>
            )}

            {payment.status === 'failed' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/rent?payment=${payment.id}`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Retry Payment
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
