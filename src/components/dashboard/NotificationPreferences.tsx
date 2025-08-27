'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Calendar,
  CreditCard,
  Wrench,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  bookingReminders: boolean
  paymentReminders: boolean
  maintenanceUpdates: boolean
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    bookingReminders: true,
    paymentReminders: true,
    maintenanceUpdates: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchNotificationPreferences()
  }, [])

  const fetchNotificationPreferences = async () => {
    try {
      const response = await fetch('/api/custom/customers/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.customer?.notificationPreferences) {
          setPreferences(data.customer.notificationPreferences)
        }
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/custom/customers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationPreferences: preferences,
        }),
      })

      if (response.ok) {
        toast.success('Notification preferences saved successfully')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to save preferences')
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading notification preferences...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications" className="text-base font-medium">
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
              </div>
            </div>
            <Switch
              id="sms-notifications"
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => handleToggle('smsNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-base font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Types</CardTitle>
          <CardDescription>Choose which types of notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="booking-reminders" className="text-base font-medium">
                  Booking Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for upcoming bookings and check-ins
                </p>
              </div>
            </div>
            <Switch
              id="booking-reminders"
              checked={preferences.bookingReminders}
              onCheckedChange={(checked) => handleToggle('bookingReminders', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="payment-reminders" className="text-base font-medium">
                  Payment Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for rent due dates and payments
                </p>
              </div>
            </div>
            <Switch
              id="payment-reminders"
              checked={preferences.paymentReminders}
              onCheckedChange={(checked) => handleToggle('paymentReminders', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-updates" className="text-base font-medium">
                  Maintenance Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Updates about maintenance requests and repairs
                </p>
              </div>
            </div>
            <Switch
              id="maintenance-updates"
              checked={preferences.maintenanceUpdates}
              onCheckedChange={(checked) => handleToggle('maintenanceUpdates', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Notification Preferences'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
