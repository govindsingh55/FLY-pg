'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useUser } from '@/lib/state/user'
import { toast } from 'sonner'

type Room = {
  id: string
  name: string
  roomType: 'single' | 'two_sharing' | 'three_sharing'
  rent: number
}

type Props = {
  propertyId?: string
  room: Room
  onClose: () => void
}

export default function RoomBookingForm({ propertyId, room, onClose }: Props) {
  const userData = useUser()
  const [foodIncluded, setFoodIncluded] = React.useState(false)
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [loading, setLoading] = React.useState(false)
  const [booking, setBooking] = React.useState<any>(null)
  const [payment, setPayment] = React.useState<any>(null)
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || ''

  async function createBooking() {
    setApiError(null)
    if (!userData.isAuthenticated || !userData.user?.id) {
      toast.info('Please sign in to book a room.')
      return
    }
    if (!propertyId || !room?.id) {
      setApiError('Missing property or room.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/api/custom/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          property: propertyId,
          room: room.id,
          foodIncluded,
          customer: userData.user.id,
        }),
      })
      const result = await res.json().catch(() => null)
      if (!res.ok || result?.error) {
        const errorMsg = result?.error || `Failed with ${res.status}`
        setApiError(errorMsg)
        toast.error(errorMsg)
        return
      }
      setBooking(result.booking)
      setPayment(result.payment)
      setStep(2)
    } catch (err: any) {
      const errorMsg = err?.message || 'Something went wrong.'
      setApiError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  async function initiatePhonePe() {
    if (!payment?.id) {
      setApiError('No payment to initiate.')
      return
    }
    setLoading(true)
    setApiError(null)
    try {
      const res = await fetch(`${apiBase}/api/custom/payments/phonepe/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentId: payment.id }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || data?.error) {
        const errorMsg = data?.error || `Failed with ${res.status}`
        setApiError(errorMsg)
        toast.error(errorMsg)
        return
      }

      // Handle PhonePe redirect
      if (data.redirectUrl) {
        // Store payment info in sessionStorage for callback handling
        sessionStorage.setItem('phonepe_payment_id', payment.id)
        sessionStorage.setItem('phonepe_booking_id', booking?.id || '')

        // Redirect to PhonePe payment page
        window.location.href = data.redirectUrl
        return
      }

      // If no redirect URL, show error
      setApiError('Failed to get payment URL from PhonePe')
      toast.error('Failed to initiate payment')
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to initiate payment.'
      setApiError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Step indicator */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3 text-sm">
          <StepDot active={step >= 1} label="Booking" />
          <div className={`h-px flex-1 ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
          <StepDot active={step >= 2} label="Payment" />
          <div className={`h-px flex-1 ${step >= 3 ? 'bg-primary' : 'bg-border'}`} />
          <StepDot active={step >= 3} label="Success" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {apiError && <div className="text-xs text-red-500 mb-2">{apiError}</div>}

        {step === 1 && (
          <>
            <div className="text-sm text-muted-foreground">
              {propertyId ? `Property: ${propertyId}` : 'Property selected'}
            </div>

            <div className="rounded-md border p-3 text-sm">
              <div className="font-medium">{room.name}</div>
              <div className="text-muted-foreground capitalize">
                {room.roomType.replace('_', ' ')}
              </div>
              <div className="mt-1 font-semibold">₹{room.rent.toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="foodIncluded"
                type="checkbox"
                className="h-4 w-4"
                checked={foodIncluded}
                onChange={(e) => setFoodIncluded(e.target.checked)}
              />
              <Label htmlFor="foodIncluded" className="text-sm">
                Add food to my booking
              </Label>
            </div>

            <div className="text-xs text-muted-foreground">
              Note: Price is calculated as (room rent × months) + (food charge × months if
              included).
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="rounded-md border p-3 text-sm">
              <div className="font-medium">Payment summary</div>
              <div className="text-muted-foreground">Booking ID: {booking?.id}</div>
              <div className="text-muted-foreground">Payment ID: {payment?.id}</div>
              <div className="mt-1 font-semibold">
                Amount: ₹{Number(booking?.price || 0).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Pay with</div>
              <div className="flex items-center gap-2">
                <Button onClick={initiatePhonePe} disabled={loading}>
                  {loading ? 'Starting PhonePe…' : 'PhonePe'}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                You will be redirected to PhonePe to complete your payment securely.
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="rounded-md border p-4 text-center">
              <div className="text-green-600 font-semibold mb-1">Payment successful</div>
              <div className="text-sm text-muted-foreground">Your booking has been created.</div>
              <div className="text-xs text-muted-foreground mt-2">Booking ID: {booking?.id}</div>
              <div className="text-xs text-muted-foreground">Payment ID: {payment?.id}</div>
              {/* Dev helper link: shows a full success page for QA/testing. */}
              <a
                href={`/payments/success?paymentId=${encodeURIComponent(payment?.id || '')}&bookingId=${encodeURIComponent(booking?.id || '')}`}
                className="mt-3 inline-block text-primary hover:underline"
              >
                View success page
              </a>
            </div>
          </>
        )}
      </div>

      <div className="border-t px-6 py-4 flex items-center justify-between gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Close
        </Button>
        {step === 1 && (
          <Button onClick={createBooking} disabled={loading}>
            {loading ? 'Booking…' : 'Continue to payment'}
          </Button>
        )}
        {step === 2 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
              Back
            </Button>
          </div>
        )}
        {step === 3 && <Button onClick={onClose}>Done</Button>}
      </div>
    </div>
  )
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`size-2 rounded-full ${active ? 'bg-primary' : 'bg-border'}`} />
      <span className={`text-xs ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  )
}
