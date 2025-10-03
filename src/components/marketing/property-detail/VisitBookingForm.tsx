'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUser } from '@/lib/state/user'
import { Calendar1, CalendarClock } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

type Props = {
  propertyId?: string
  onClose: () => void
}

export default function VisitBookingForm({ propertyId, onClose }: Props) {
  const userData = useUser()
  const [visitDate, setVisitDate] = React.useState<Date | undefined>(undefined)
  const [visitTime, setVisitTime] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [guestName, setGuestName] = React.useState('')
  const [guestEmail, setGuestEmail] = React.useState('')
  const [guestPhone, setGuestPhone] = React.useState('')
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({})

  function validateForm() {
    const newErrors: { [key: string]: string } = {}
    if (!visitDate) newErrors.visitDate = 'Please select a date.'
    if (!visitTime) newErrors.visitTime = 'Please select a time slot.'
    if (!userData.isAuthenticated || !userData.user?.id) {
      if (!guestName.trim()) newErrors.guestName = 'Name is required.'
      if (!guestEmail.trim()) newErrors.guestEmail = 'Email is required.'
      if (!guestPhone.trim()) newErrors.guestPhone = 'Phone is required.'
    }
    return newErrors
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors = validateForm()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    setSubmitting(true)
    setApiError(null)
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || ''
      const d = visitDate!
      const pad = (n: number) => String(n).padStart(2, '0')
      // Convert to ISO 8601 format: YYYY-MM-DDTHH:mm:ss
      let isoDate: string
      if (visitTime) {
        // Parse time string (e.g., '11 am') to 24h format
        const [hourStr, period] = visitTime.split(' ')
        let hour = parseInt(hourStr)
        if (period === 'pm' && hour < 12) hour += 12
        if (period === 'am' && hour === 12) hour = 0
        isoDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:00:00`
      } else {
        isoDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`
      }

      const body: any = {
        property: propertyId,
        visitDate: isoDate,
        notes: notes || undefined,
      }
      if (userData.isAuthenticated && userData.user?.id) {
        body.customer = userData.user.id
      } else {
        body.guestUser = {
          guestName,
          email: guestEmail,
          phone: guestPhone,
        }
      }

      const res = await fetch(`${apiBase}/api/custom/visit-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      let result: any
      try {
        result = await res.json()
      } catch {
        result = null
      }

      if (!res.ok || (result && result.error)) {
        const errorMsg = result?.error || `Failed with ${res.status}`
        setApiError(errorMsg)
        toast.error(errorMsg)
        return
      }

      toast.success('Visit booked successfully!')
      onClose()
    } catch (err: any) {
      const errorMsg = err?.message || 'Something went wrong.'
      setApiError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full max-h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 min-h-0">
        {apiError && <div className="text-xs text-red-500 mb-2">{apiError}</div>}
        <div className="text-sm text-muted-foreground">
          {propertyId ? `Property: ${propertyId}` : 'Property selected'}
        </div>

        {userData.isAuthenticated && userData.user?.id ? (
          <input type="hidden" name="userId" value={userData.user?.id} />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Your name</label>
              <Input
                className="w-full"
                placeholder="John Doe"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                aria-invalid={!!errors.guestName}
                required
              />
              {errors.guestName && <span className="text-xs text-red-500">{errors.guestName}</span>}
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Email</label>
              <Input
                className="w-full"
                type="email"
                value={guestEmail}
                placeholder="john.doe@example.com"
                onChange={(e) => setGuestEmail(e.target.value)}
                aria-invalid={!!errors.guestEmail}
                required
              />
              {errors.guestEmail && (
                <span className="text-xs text-red-500">{errors.guestEmail}</span>
              )}
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Phone</label>
              <Input
                className="w-full"
                type="tel"
                placeholder="9876543210"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                aria-invalid={!!errors.guestPhone}
                required
              />
              {errors.guestPhone && (
                <span className="text-xs text-red-500">{errors.guestPhone}</span>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-1">
          <VisitDate date={visitDate} onChange={setVisitDate} />
          {errors.visitDate && <span className="text-xs text-red-500">{errors.visitDate}</span>}
        </div>

        <div className="grid gap-1">
          <VisitTime value={visitTime} onChange={setVisitTime} />
          {errors.visitTime && <span className="text-xs text-red-500">{errors.visitTime}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="notes" className="px-1">
            Notes (optional)
          </Label>
          <textarea
            id="notes"
            className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none resize-y"
            placeholder="Any notes for the host"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-shrink-0 border-t bg-background px-6 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Book visit'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function VisitDate({
  date,
  onChange,
}: {
  date: Date | undefined
  onChange: (d: Date | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1 w-full">
        Preferred date
      </Label>
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date" className="w-full justify-between font-normal">
            {date ? date.toLocaleDateString() : 'Select date'}
            <Calendar1 />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(d) => {
              onChange(d)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function VisitTime({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const timeSlots = ['11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm']

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="time" className="px-1 w-full">
        Preferred time (optional)
      </Label>
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button variant="outline" id="time" className="w-full justify-between font-normal">
            {value ? value : 'Select time'}
            <CalendarClock />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-3" align="start">
          <div className="flex flex-col gap-3">
            {timeSlots.map((slot) => (
              <Button
                key={slot}
                variant="outline"
                className={`w-full justify-between font-normal cursor-pointer ${value === slot ? 'bg-muted' : ''}`}
                onClick={() => {
                  onChange(slot)
                  setOpen(false)
                }}
                aria-pressed={value === slot}
              >
                {slot}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
