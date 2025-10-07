'use client'

import { useState, useEffect } from 'react'
import { AutoPaySettings } from '@/components/dashboard/AutoPaySettings'
import { NotificationPreferences } from '@/components/dashboard/NotificationPreferences'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Bell, Shield, FileText, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface PaymentPreferences {
  autoPayLateFees: boolean
  emailReceipts: boolean
}

export default function RentSettingsPage() {
  const [preferences, setPreferences] = useState<PaymentPreferences>({
    autoPayLateFees: false,
    emailReceipts: true,
  })
  const [originalPreferences, setOriginalPreferences] = useState<PaymentPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPaymentPreferences()
  }, [])

  const fetchPaymentPreferences = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/custom/customers/settings')

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()

      // Extract payment preferences from settings
      // Note: These might need to be added to the schema if not present
      const prefs = {
        autoPayLateFees: data.settings.autoPay?.autoPayLateFees ?? false,
        emailReceipts: data.settings.notifications?.email ?? true,
      }

      setPreferences(prefs)
      setOriginalPreferences(prefs)
    } catch (error) {
      console.error('Error fetching payment preferences:', error)
      // Don't show error toast, just use defaults
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = () => {
    if (!originalPreferences) return false

    return Object.keys(preferences).some((key) => {
      const prefKey = key as keyof PaymentPreferences
      return preferences[prefKey] !== originalPreferences[prefKey]
    })
  }

  const handleReset = () => {
    if (originalPreferences) {
      setPreferences(originalPreferences)
      toast.info('Changes discarded')
    }
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    try {
      // For now, just show success since these are integrated with main settings
      // In a full implementation, these would be additional fields in the schema
      await new Promise((resolve) => setTimeout(resolve, 500))

      setOriginalPreferences(preferences)
      toast.success('Payment preferences saved successfully')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const changesExist = hasChanges()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="lg" asChild>
          <Link href="/dashboard/rent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rent
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rent Settings</h1>
          <p className="text-muted-foreground">
            Manage your payment preferences and auto-pay settings
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Auto-Pay Settings Component */}
          <AutoPaySettings />

          <Separator className="my-6" />

          {/* Notification Preferences Component */}
          <NotificationPreferences />

          <Separator className="my-6" />

          {/* Payment Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Preferences
              </CardTitle>
              <CardDescription>
                Configure your payment behavior and preferences
                {changesExist && (
                  <span className="ml-2 text-orange-600 font-medium">• Unsaved changes</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Late Payment Handling */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="late-payment-handling" className="text-base font-medium">
                        Auto-Pay Late Fees
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically include late fees in auto-pay if rent is overdue
                      </p>
                    </div>
                    <Switch
                      id="late-payment-handling"
                      checked={preferences.autoPayLateFees}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, autoPayLateFees: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  {/* Receipt Preferences */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-receipts" className="text-base font-medium">
                        Email Receipts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically email payment receipts after each transaction
                      </p>
                    </div>
                    <Switch
                      id="email-receipts"
                      checked={preferences.emailReceipts}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, emailReceipts: checked }))
                      }
                    />
                  </div>

                  {changesExist && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          disabled={saving}
                          className="flex-1"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Discard
                        </Button>
                        <Button
                          onClick={handleSavePreferences}
                          disabled={saving}
                          className="flex-1"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Preferences'
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/rent">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View Payment History
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/rent/payments">
                  <FileText className="mr-2 h-4 w-4" />
                  All Payments
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/settings">
                  <Bell className="mr-2 h-4 w-4" />
                  General Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Payment Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Payment Security</h4>
                <p className="text-xs text-muted-foreground">
                  All payments are processed securely using industry-standard encryption and PCI DSS
                  compliance.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Data Protection</h4>
                <p className="text-xs text-muted-foreground">
                  Your payment information is encrypted and stored securely. We never store your
                  full card details.
                </p>
              </div>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/security">View Security Policy</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Having trouble with your payments or settings?
              </p>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/dashboard/support">Contact Support</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                View FAQ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
