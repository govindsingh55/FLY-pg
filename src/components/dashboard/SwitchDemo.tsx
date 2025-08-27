'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard,
  Bell,
  Moon,
  Wifi,
  Shield,
  Eye,
  Smartphone,
  Mail,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export function SwitchDemo() {
  const [settings, setSettings] = useState({
    autoPay: false,
    notifications: true,
    darkMode: false,
    wifi: true,
    security: true,
    visibility: false,
    mobileApp: true,
    emailUpdates: true,
  })

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Switch Component Demo
          </CardTitle>
          <CardDescription>
            Examples of how the switch component can be used in different contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-Pay Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="auto-pay-demo" className="text-base font-medium">
                  Auto-Pay
                </Label>
                <p className="text-sm text-muted-foreground">Automatically pay rent on due date</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {settings.autoPay ? (
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
              <Switch
                id="auto-pay-demo"
                checked={settings.autoPay}
                onCheckedChange={(checked) => handleToggle('autoPay', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="notifications-demo" className="text-base font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
            </div>
            <Switch
              id="notifications-demo"
              checked={settings.notifications}
              onCheckedChange={(checked) => handleToggle('notifications', checked)}
            />
          </div>

          <Separator />

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode-demo" className="text-base font-medium">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">Use dark theme for the dashboard</p>
              </div>
            </div>
            <Switch
              id="dark-mode-demo"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleToggle('darkMode', checked)}
            />
          </div>

          <Separator />

          {/* WiFi Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="wifi-demo" className="text-base font-medium">
                  WiFi Access
                </Label>
                <p className="text-sm text-muted-foreground">Enable WiFi access in your room</p>
              </div>
            </div>
            <Switch
              id="wifi-demo"
              checked={settings.wifi}
              onCheckedChange={(checked) => handleToggle('wifi', checked)}
            />
          </div>

          <Separator />

          {/* Security Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="security-demo" className="text-base font-medium">
                  Two-Factor Authentication
                </Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <Switch
              id="security-demo"
              checked={settings.security}
              onCheckedChange={(checked) => handleToggle('security', checked)}
            />
          </div>

          <Separator />

          {/* Profile Visibility Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="visibility-demo" className="text-base font-medium">
                  Public Profile
                </Label>
                <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
              </div>
            </div>
            <Switch
              id="visibility-demo"
              checked={settings.visibility}
              onCheckedChange={(checked) => handleToggle('visibility', checked)}
            />
          </div>

          <Separator />

          {/* Mobile App Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="mobile-demo" className="text-base font-medium">
                  Mobile App Access
                </Label>
                <p className="text-sm text-muted-foreground">Allow access from mobile app</p>
              </div>
            </div>
            <Switch
              id="mobile-demo"
              checked={settings.mobileApp}
              onCheckedChange={(checked) => handleToggle('mobileApp', checked)}
            />
          </div>

          <Separator />

          {/* Email Updates Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="email-demo" className="text-base font-medium">
                  Email Updates
                </Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
            </div>
            <Switch
              id="email-demo"
              checked={settings.emailUpdates}
              onCheckedChange={(checked) => handleToggle('emailUpdates', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Switch Component Usage Examples</CardTitle>
          <CardDescription>
            Different ways to use the switch component in your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Simple Toggle</h4>
            <p className="text-sm text-muted-foreground">Basic on/off functionality with a label</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. With Status Badge</h4>
            <p className="text-sm text-muted-foreground">
              Show current status with a badge next to the switch
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">3. With Description</h4>
            <p className="text-sm text-muted-foreground">
              Include descriptive text to explain the setting
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">4. With Icons</h4>
            <p className="text-sm text-muted-foreground">
              Use icons to make the setting more visually appealing
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">5. Disabled State</h4>
            <p className="text-sm text-muted-foreground">
              Disable the switch when the action is not available
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
