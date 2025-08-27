import { AutoPaySettings } from '@/components/dashboard/AutoPaySettings'
import { NotificationPreferences } from '@/components/dashboard/NotificationPreferences'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Bell, Shield, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RentSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
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
          {/* Auto-Pay Settings */}
          <AutoPaySettings />

          <Separator />

          {/* Notification Preferences */}
          <NotificationPreferences />

          <Separator />

          {/* Payment Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Preferences
              </CardTitle>
              <CardDescription>Configure your payment behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Late Payment Handling */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="late-payment-handling" className="text-base font-medium">
                    Late Payment Handling
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically pay late fees when rent is overdue
                  </p>
                </div>
                <Switch id="late-payment-handling" />
              </div>

              {/* Payment Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-reminders" className="text-base font-medium">
                    Payment Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders before rent is due
                  </p>
                </div>
                <Switch id="payment-reminders" defaultChecked />
              </div>

              {/* Receipt Preferences */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-receipts" className="text-base font-medium">
                    Email Receipts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send payment receipts to your email
                  </p>
                </div>
                <Switch id="email-receipts" defaultChecked />
              </div>

              <Button className="w-full">Save Preferences</Button>
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
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Download Receipts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Notification Settings
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
              <Button variant="outline" size="sm" className="w-full">
                View Security Policy
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
              <Button variant="outline" size="sm" className="w-full">
                Contact Support
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                View FAQ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
