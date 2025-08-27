'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  MapPin,
  Building2,
  Bed,
  DollarSign,
  Clock,
  AlertCircle,
  Star,
  MessageSquare,
  FileText,
  Download,
  X,
  Plus,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Booking {
  id: string
  status: string
  startDate: string
  endDate: string
  price: number
  periodInMonths: number
  checkInDate?: string
  checkOutDate?: string
  specialRequests?: string
  notes?: string
  rating?: number
  review?: string
  reviewedAt?: string
  cancellationReason?: string
  cancelledAt?: string
  extensionRequests?: Array<{
    requestedEndDate: string
    reason: string
    status: string
    requestedAt: string
    respondedAt?: string
    responseNote?: string
  }>
  maintenanceRequests?: Array<{
    title: string
    description: string
    priority: string
    status: string
    requestedAt: string
    resolvedAt?: string
    resolutionNote?: string
  }>
  bookingDocuments?: Array<{
    document: {
      url: string
      filename: string
    }
    type: string
    description?: string
    uploadedAt: string
  }>
  property: {
    id: string
    name: string
    address: string
    images?: Array<{ url: string }>
  }
  room: {
    id: string
    name: string
    type: string
    amenities: string[]
  }
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showExtendDialog, setShowExtendDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [extendDate, setExtendDate] = useState('')
  const [extendReason, setExtendReason] = useState('')
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')

  const bookingId = params.id as string

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/custom/customers/bookings/${bookingId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch booking')
      }
      const data = await response.json()
      setBooking(data.booking)
    } catch (error) {
      console.error('Error fetching booking:', error)
      toast.error('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/custom/customers/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel booking')
      }

      const data = await response.json()
      setBooking(data.booking)
      setShowCancelDialog(false)
      setCancelReason('')
      toast.success('Booking cancelled successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking')
    } finally {
      setActionLoading(false)
    }
  }

  const handleExtendBooking = async () => {
    if (!extendDate || !extendReason.trim()) {
      toast.error('Please provide both date and reason')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/custom/customers/bookings/${bookingId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestedEndDate: extendDate,
          reason: extendReason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to request extension')
      }

      const data = await response.json()
      setBooking(data.booking)
      setShowExtendDialog(false)
      setExtendDate('')
      setExtendReason('')
      toast.success('Extension request submitted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to request extension')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!review.trim() || review.length < 10) {
      toast.error('Review must be at least 10 characters long')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/custom/customers/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      const data = await response.json()
      setBooking(data.booking)
      setShowReviewDialog(false)
      setRating(5)
      setReview('')
      toast.success('Review submitted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'extended':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The booking you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/dashboard/bookings')}>Back to Bookings</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <p className="text-muted-foreground">Manage your booking and view details</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property & Room Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Property & Room Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Property</Label>
                  <p className="font-medium">{booking.property.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {booking.property.address}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Room</Label>
                  <p className="font-medium">{booking.room.name}</p>
                  <p className="text-sm text-muted-foreground">{booking.room.type}</p>
                </div>
              </div>

              {booking.room.amenities && booking.room.amenities.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amenities</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {booking.room.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                  <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                  <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="font-medium">{booking.periodInMonths} months</p>
                </div>
              </div>

              {booking.checkInDate && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Check-in Date</Label>
                  <p className="font-medium">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">₹{booking.price.toLocaleString()}</span>
                <span className="text-muted-foreground">per month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total: ₹{(booking.price * booking.periodInMonths).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Extension Requests */}
          {booking.extensionRequests && booking.extensionRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Extension Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.extensionRequests.map((request, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {new Date(request.requestedEndDate).toLocaleDateString()}
                        </span>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{request.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                      {request.responseNote && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">
                          <strong>Response:</strong> {request.responseNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maintenance Requests */}
          {booking.maintenanceRequests && booking.maintenanceRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Maintenance Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.maintenanceRequests.map((request, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{request.title}</span>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                      {request.resolutionNote && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">
                          <strong>Resolution:</strong> {request.resolutionNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {booking.bookingDocuments && booking.bookingDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {booking.bookingDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{doc.document.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.document.url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review */}
          {booking.rating && booking.review && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Your Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < booking.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground">
                    {new Date(booking.reviewedAt!).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{booking.review}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.status === 'confirmed' && (
                <>
                  <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <X className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Booking</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel this booking? This action cannot be
                          undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cancel-reason">Cancellation Reason</Label>
                          <Textarea
                            id="cancel-reason"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Please provide a reason for cancellation..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleCancelBooking}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Request Extension
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Extension</DialogTitle>
                        <DialogDescription>
                          Request to extend your booking period.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="extend-date">New End Date</Label>
                          <Input
                            id="extend-date"
                            type="date"
                            value={extendDate}
                            onChange={(e) => setExtendDate(e.target.value)}
                            min={new Date(booking.endDate).toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor="extend-reason">Reason for Extension</Label>
                          <Textarea
                            id="extend-reason"
                            value={extendReason}
                            onChange={(e) => setExtendReason(e.target.value)}
                            placeholder="Please provide a reason for the extension..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleExtendBooking} disabled={actionLoading}>
                          {actionLoading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {booking.status === 'completed' && !booking.rating && (
                <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Write Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                      <DialogDescription>
                        Share your experience with this property.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review">Review</Label>
                        <Textarea
                          id="review"
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Share your experience..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitReview} disabled={actionLoading}>
                        {actionLoading ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(booking.specialRequests || booking.notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {booking.specialRequests && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Special Requests
                    </Label>
                    <p className="text-sm">{booking.specialRequests}</p>
                  </div>
                )}
                {booking.notes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Additional Notes
                    </Label>
                    <p className="text-sm">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cancellation Info */}
          {booking.status === 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Cancellation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Cancelled On
                    </Label>
                    <p className="text-sm">{new Date(booking.cancelledAt!).toLocaleDateString()}</p>
                  </div>
                  {booking.cancellationReason && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
                      <p className="text-sm">{booking.cancellationReason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
