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
import { CreditCard, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { toast } from 'sonner'

interface AutoPaySettings {
  enabled: boolean
  paymentMethod: string | null
  paymentDay: number
  maxAmount: number | null
  notifications: boolean
  lastUpdated?: string | null
}

interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'netbanking'
  name: string
  maskedNumber?: string
  isDefault: boolean
}

export function AutoPaySettings() {
  // React Query hooks
  const { data: settingsData, isLoading } = useSettings()
  const updateSettingsMutation = useUpdateSettings()

  const [settings, setSettings] = useState<AutoPaySettings>({
    enabled: false,
    paymentMethod: null,
    paymentDay: 1,
    maxAmount: null,
    notifications: true,
  })
  const [originalSettings, setOriginalSettings] = useState<AutoPaySettings | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  // Load settings from React Query data
  useEffect(() => {
    if (settingsData) {
      const autoPayData = {
        enabled: settingsData.autoPay.enabled ?? false,
        paymentMethod: settingsData.autoPay.paymentMethod || null,
        paymentDay: settingsData.autoPay.day ?? 1,
        maxAmount: settingsData.autoPay.maxAmount || null,
        notifications: settingsData.autoPay.notifications ?? true,
        lastUpdated: settingsData.autoPay.lastUpdated || null,
      }

      setSettings(autoPayData)
      setOriginalSettings(autoPayData)
    }
  }, [settingsData])

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/custom/customers/payments/methods')
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data.paymentMethods || [])
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const hasChanges = () => {
    if (!originalSettings) return false

    return (
      settings.enabled !== originalSettings.enabled ||
      settings.paymentMethod !== originalSettings.paymentMethod ||
      settings.paymentDay !== originalSettings.paymentDay ||
      settings.maxAmount !== originalSettings.maxAmount ||
      settings.notifications !== originalSettings.notifications
    )
  }

  const handleReset = () => {
    if (originalSettings) {
      setSettings(originalSettings)
      toast.info('Changes discarded')
    }
  }

  const handleToggleAutoPay = async (enabled: boolean) => {
    if (!enabled && settings.enabled) {
      // Show confirmation dialog for disabling
      const confirmed = window.confirm(
        'Are you sure you want to disable auto-pay? This will stop automatic rent payments.',
      )
      if (!confirmed) {
        return
      }
    }

    setSettings((prev) => ({ ...prev, enabled }))
  }

  const handleSaveSettings = async () => {
    // Validate settings before saving
    if (settings.enabled) {
      if (!settings.paymentMethod) {
        toast.error('Please select a payment method')
        return
      }
      if (settings.maxAmount && settings.maxAmount < 0) {
        toast.error('Maximum amount cannot be negative')
        return
      }
    }

    // Use React Query mutation with optimistic updates
    await updateSettingsMutation.mutateAsync({
      autoPay: {
        enabled: settings.enabled,
        paymentMethod: settings.paymentMethod,
        day: settings.paymentDay,
        maxAmount: settings.maxAmount,
        notifications: settings.notifications,
        lastUpdated: new Date().toISOString(), // Include for completeness
      },
    })

    // Update original settings after successful save
    setOriginalSettings(settings)
  }

  const changesExist = hasChanges()
  const isSaving = updateSettingsMutation.isPending

  if (isLoading) {
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
              <CardDescription>
                Automatically pay your rent on the scheduled date
                {changesExist && (
                  <span className="ml-2 text-orange-600 font-medium">• Unsaved changes</span>
                )}
              </CardDescription>
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
              disabled={isSaving}
            />
          </div>

          {settings.enabled && (
            <>
              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select
                  value={settings.paymentMethod || ''}
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
                  <p className="text-sm text-orange-600">
                    ⚠️ No payment methods found. Please add a payment method first.
                  </p>
                )}
              </div>

              {/* Payment Day Selection */}
              <div className="space-y-2">
                <Label htmlFor="payment-day">Payment Day of Month</Label>
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
                        Day {day} of each month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Rent will be automatically paid on this day each month
                </p>
              </div>

              {/* Maximum Amount */}
              <div className="space-y-2">
                <Label htmlFor="max-amount">Maximum Amount (₹)</Label>
                <Input
                  id="max-amount"
                  type="number"
                  min={0}
                  value={settings.maxAmount || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxAmount: parseFloat(e.target.value) || null,
                    }))
                  }
                  placeholder="Enter maximum amount (optional)"
                />
                <p className="text-sm text-muted-foreground">
                  Auto-pay will not process payments above this amount (leave empty for no limit)
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {changesExist && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isSaving}
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Discard Changes
              </Button>
              <Button onClick={handleSaveSettings} disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Auto-Pay Settings'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
          {settings.lastUpdated && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(settings.lastUpdated).toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
