'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AutoPaySettings {
  enabled: boolean
  paymentMethod: string
  paymentDay: number
  maxAmount: number
  notifications: boolean
  lastUpdated?: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'netbanking'
  name: string
  maskedNumber?: string
  isDefault: boolean
}

export function AutoPaySettings() {
  const [settings, setSettings] = useState<AutoPaySettings>({
    enabled: false,
    paymentMethod: '',
    paymentDay: 1,
    maxAmount: 0,
    notifications: true,
  })
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAutoPaySettings()
    fetchPaymentMethods()
  }, [])

  const fetchAutoPaySettings = async () => {
    try {
      const response = await fetch('/api/custom/customers/payments/auto-pay')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching auto-pay settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/custom/customers/payments/methods')
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data.paymentMethods)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const handleToggleAutoPay = async (enabled: boolean) => {
    if (!enabled && settings.enabled) {
      // Show confirmation dialog for disabling
      if (
        !confirm(
          'Are you sure you want to disable auto-pay? This will stop automatic rent payments.',
        )
      ) {
        return
      }
    }

    setSaving(true)
    try {
      const response = await fetch('/api/custom/customers/payments/auto-pay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          enabled,
        }),
      })

      if (response.ok) {
        setSettings((prev) => ({ ...prev, enabled }))
        toast.success(enabled ? 'Auto-pay enabled successfully' : 'Auto-pay disabled successfully')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update auto-pay settings')
      }
    } catch (error) {
      console.error('Error updating auto-pay settings:', error)
      toast.error('Failed to update auto-pay settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/custom/customers/payments/auto-pay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Auto-pay settings saved successfully')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving auto-pay settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading auto-pay settings...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Auto-pay Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Auto-Pay Settings
              </CardTitle>
              <CardDescription>Automatically pay your rent on the scheduled date</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {settings.enabled ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-pay-toggle" className="text-base font-medium">
                Enable Auto-Pay
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically pay your rent on the due date
              </p>
            </div>
            <Switch
              id="auto-pay-toggle"
              checked={settings.enabled}
              onCheckedChange={handleToggleAutoPay}
              disabled={saving}
            />
          </div>

          {settings.enabled && (
            <>
              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select
                  value={settings.paymentMethod}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, paymentMethod: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>{method.name}</span>
                          {method.maskedNumber && (
                            <span className="text-muted-foreground">({method.maskedNumber})</span>
                          )}
                          {method.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {paymentMethods.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No payment methods found. Please add a payment method first.
                  </p>
                )}
              </div>

              {/* Payment Day Selection */}
              <div className="space-y-2">
                <Label htmlFor="payment-day">Payment Day</Label>
                <Select
                  value={settings.paymentDay.toString()}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, paymentDay: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}st of each month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Rent will be automatically paid on this day of each month
                </p>
              </div>

              {/* Maximum Amount */}
              <div className="space-y-2">
                <Label htmlFor="max-amount">Maximum Amount (₹)</Label>
                <Input
                  id="max-amount"
                  type="number"
                  value={settings.maxAmount}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, maxAmount: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="Enter maximum amount"
                />
                <p className="text-sm text-muted-foreground">
                  Auto-pay will not process payments above this amount
                </p>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications-toggle">Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications before and after auto-pay processing
                  </p>
                </div>
                <Switch
                  id="notifications-toggle"
                  checked={settings.notifications}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, notifications: checked }))
                  }
                />
              </div>

              {/* Save Button */}
              <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Auto-Pay Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Automatic Processing</h4>
            <p className="text-sm text-muted-foreground">
              Your rent will be automatically charged on the selected day of each month using your
              chosen payment method.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Safety Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Maximum amount limit prevents unexpected charges</li>
              <li>• Email notifications before and after processing</li>
              <li>• You can disable auto-pay at any time</li>
              <li>• Failed payments will be retried once</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Important Notes</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure your payment method has sufficient funds</li>
              <li>• Auto-pay will be paused if a payment fails</li>
              <li>• You&apos;ll receive a receipt after each successful payment</li>
              <li>• Changes take effect from the next billing cycle</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
