'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Bell,
  Shield,
  Mail,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Palette,
  Save,
  Eye,
  RefreshCw,
  AlertCircle,
  Trash2,
  Lock,
} from 'lucide-react'
import {
  useSettings,
  useUpdateSettings,
  useChangeEmail,
  useChangePassword,
  useChangePhone,
  useDeactivateAccount,
  useDeleteAccount,
} from '@/hooks/useSettings'
import { toast } from 'sonner'

interface Settings {
  // Notifications
  email: boolean
  sms: boolean
  push: boolean
  bookingReminders: boolean
  paymentReminders: boolean
  maintenanceUpdates: boolean
  // Preferences
  darkMode: boolean
  language: string
  timezone: string
  dateFormat: string
  currency: string
  // Privacy
  profileVisibility: string
  showEmail: boolean
  showPhone: boolean
  allowMarketingEmails: boolean
  twoFactorEnabled: boolean
  twoFactorMethod: string
  sessionTimeout: number
}

export default function SettingsPage() {
  // Theme hook for instant theme updates
  const { setTheme } = useTheme()

  // React Query hooks
  const { data: settingsData, isLoading, isError, error: fetchError, refetch } = useSettings()
  const updateSettingsMutation = useUpdateSettings()
  const changeEmailMutation = useChangeEmail()
  const changePasswordMutation = useChangePassword()
  const changePhoneMutation = useChangePhone()
  const deactivateAccountMutation = useDeactivateAccount()
  const deleteAccountMutation = useDeleteAccount()

  // Local state for form
  const [settings, setSettings] = useState<Settings>({
    email: true,
    sms: false,
    push: true,
    bookingReminders: true,
    paymentReminders: true,
    maintenanceUpdates: true,
    darkMode: false,
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'dd/mm/yyyy',
    currency: 'INR',
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    allowMarketingEmails: false,
    twoFactorEnabled: false,
    twoFactorMethod: 'sms',
    sessionTimeout: 30,
  })
  const [originalSettings, setOriginalSettings] = useState<Settings | null>(null)

  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Form states for modals
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  // Update local state when settings data loads from React Query
  useEffect(() => {
    if (settingsData) {
      const loadedSettings = {
        email: settingsData.notifications.email ?? true,
        sms: settingsData.notifications.sms ?? false,
        push: settingsData.notifications.push ?? true,
        bookingReminders: settingsData.notifications.bookingReminders ?? true,
        paymentReminders: settingsData.notifications.paymentReminders ?? true,
        maintenanceUpdates: settingsData.notifications.maintenanceUpdates ?? true,
        darkMode: settingsData.preferences.darkMode ?? false,
        language: settingsData.preferences.language ?? 'en',
        timezone: settingsData.preferences.timezone ?? 'Asia/Kolkata',
        dateFormat: settingsData.preferences.dateFormat ?? 'dd/mm/yyyy',
        currency: settingsData.preferences.currency ?? 'INR',
        profileVisibility: settingsData.privacy.profileVisibility ?? 'private',
        showEmail: settingsData.privacy.showEmail ?? false,
        showPhone: settingsData.privacy.showPhone ?? false,
        allowMarketingEmails: settingsData.privacy.allowMarketingEmails ?? false,
        twoFactorEnabled: settingsData.privacy.twoFactorEnabled ?? false,
        twoFactorMethod: settingsData.privacy.twoFactorMethod ?? 'sms',
        sessionTimeout: settingsData.privacy.sessionTimeout ?? 30,
      }

      setSettings(loadedSettings)
      setOriginalSettings(loadedSettings)
    }
  }, [settingsData])

  // Apply theme instantly when dark mode setting changes
  useEffect(() => {
    setTheme(settings.darkMode ? 'dark' : 'light')
  }, [settings.darkMode, setTheme])

  const handleSettingChange = (key: keyof Settings, value: boolean | string | number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Check if settings have been modified
  const hasChanges = () => {
    if (!originalSettings) return false

    return Object.keys(settings).some((key) => {
      const settingsKey = key as keyof Settings
      return settings[settingsKey] !== originalSettings[settingsKey]
    })
  }

  // Reset to original settings
  const handleReset = () => {
    if (originalSettings) {
      setSettings(originalSettings)
      toast.info('Changes discarded')
    }
  }

  const handleSaveSettings = async () => {
    // Map component state to API structure
    const payload = {
      notifications: {
        email: settings.email,
        sms: settings.sms,
        push: settings.push,
        bookingReminders: settings.bookingReminders,
        paymentReminders: settings.paymentReminders,
        maintenanceUpdates: settings.maintenanceUpdates,
      },
      preferences: {
        darkMode: settings.darkMode,
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        currency: settings.currency,
      },
      privacy: {
        profileVisibility: settings.profileVisibility,
        showEmail: settings.showEmail,
        showPhone: settings.showPhone,
        allowMarketingEmails: settings.allowMarketingEmails,
        twoFactorEnabled: settings.twoFactorEnabled,
        twoFactorMethod: settings.twoFactorMethod,
        sessionTimeout: settings.sessionTimeout,
      },
    }

    // Use React Query mutation with optimistic updates
    await updateSettingsMutation.mutateAsync(payload)

    // Update original settings after successful save
    setOriginalSettings(settings)
  }

  const handleChangeEmail = async () => {
    if (!newEmail || !currentPassword) {
      toast.error('Please fill in all fields')
      return
    }

    await changeEmailMutation.mutateAsync({ newEmail, currentPassword })
    setShowEmailModal(false)
    setNewEmail('')
    setCurrentPassword('')
    // Refresh settings to show new email
    refetch()
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    await changePasswordMutation.mutateAsync({ currentPassword, newPassword })
    setShowPasswordModal(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleChangePhone = async () => {
    if (!newPhone) {
      toast.error('Please enter a phone number')
      return
    }

    if (!/^[6-9]\d{9}$/.test(newPhone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number')
      return
    }

    await changePhoneMutation.mutateAsync({ newPhone })
    setShowPhoneModal(false)
    setNewPhone('')
    // Refresh settings to show new phone
    refetch()
  }

  const handleDeactivateAccount = async () => {
    await deactivateAccountMutation.mutateAsync()
    setShowDeactivateModal(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    if (!currentPassword) {
      toast.error('Please enter your password')
      return
    }

    await deleteAccountMutation.mutateAsync({
      confirmation: deleteConfirmation,
      password: currentPassword,
    })
    setShowDeleteModal(false)
    setDeleteConfirmation('')
    setCurrentPassword('')
  }

  // Determine if any mutation is in progress
  const isSaving =
    updateSettingsMutation.isPending ||
    changeEmailMutation.isPending ||
    changePasswordMutation.isPending ||
    changePhoneMutation.isPending ||
    deactivateAccountMutation.isPending ||
    deleteAccountMutation.isPending

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>

        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Settings</h3>
            <p className="text-muted-foreground text-center mb-4">
              {fetchError instanceof Error ? fetchError.message : 'Failed to load settings'}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const changesExist = hasChanges()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
            {changesExist && (
              <span className="ml-2 text-orange-600 font-medium">• Unsaved changes</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {changesExist && (
            <Button variant="outline" onClick={handleReset} disabled={isSaving}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Discard Changes
            </Button>
          )}
          <Button onClick={handleSaveSettings} disabled={!changesExist || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications about your account and bookings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.email}
                  onCheckedChange={(checked) => handleSettingChange('email', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.sms}
                  onCheckedChange={(checked) => handleSettingChange('sms', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={settings.push}
                  onCheckedChange={(checked) => handleSettingChange('push', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Booking Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming bookings
                  </p>
                </div>
                <Switch
                  checked={settings.bookingReminders}
                  onCheckedChange={(checked) => handleSettingChange('bookingReminders', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Payment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded when rent is due</p>
                </div>
                <Switch
                  checked={settings.paymentReminders}
                  onCheckedChange={(checked) => handleSettingChange('paymentReminders', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about maintenance requests
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceUpdates}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceUpdates', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your privacy settings and security preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                </div>
                <select
                  value={settings.profileVisibility}
                  onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                  className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Email on Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email address publicly
                  </p>
                </div>
                <Switch
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Phone on Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your phone number publicly
                  </p>
                </div>
                <Switch
                  checked={settings.showPhone}
                  onCheckedChange={(checked) => handleSettingChange('showPhone', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional emails and offers
                  </p>
                </div>
                <Switch
                  checked={settings.allowMarketingEmails}
                  onCheckedChange={(checked) =>
                    handleSettingChange('allowMarketingEmails', checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={settings.twoFactorEnabled ? 'default' : 'secondary'}>
                    {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSettingChange('twoFactorEnabled', !settings.twoFactorEnabled)
                    }
                  >
                    {settings.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>

              {settings.twoFactorEnabled && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">2FA Method</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your verification method
                      </p>
                    </div>
                    <select
                      value={settings.twoFactorMethod}
                      onChange={(e) => handleSettingChange('twoFactorMethod', e.target.value)}
                      className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="app">Authenticator App</option>
                    </select>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto logout after inactivity (minutes)
                  </p>
                </div>
                <Input
                  type="number"
                  min={5}
                  max={1440}
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the appearance of your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>Set your language and timezone preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Asia/Kolkata">India Standard Time</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <select
                  id="dateFormat"
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Important account-related actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShowEmailModal(true)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Change Email Address
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShowPasswordModal(true)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShowPhoneModal(true)}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Update Phone Number
              </Button>
            </div>

            <Separator />

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                variant="outline"
                className="justify-start text-orange-600 hover:text-orange-700"
                onClick={() => setShowDeactivateModal(true)}
              >
                <Lock className="mr-2 h-4 w-4" />
                Deactivate Account
              </Button>
              <Button
                variant="outline"
                className="justify-start text-red-600 hover:text-red-700"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address and current password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new.email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password-email">Current Password</Label>
              <Input
                id="confirm-password-email"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeEmail}>Change Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
              />
            </div>
            <div>
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Phone Modal */}
      <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Phone Number</DialogTitle>
            <DialogDescription>Enter your new 10-digit Indian mobile number.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-phone">New Phone Number</Label>
              <Input
                id="new-phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhoneModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePhone}>Update Phone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Account Modal */}
      <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Account</DialogTitle>
            <DialogDescription>
              Your account will be temporarily deactivated. You can reactivate it anytime by logging
              in again.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> Deactivating your account will:
            </p>
            <ul className="mt-2 text-sm text-orange-700 list-disc list-inside space-y-1">
              <li>Hide your profile from others</li>
              <li>Pause active bookings and payments</li>
              <li>Prevent new bookings</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivateAccount}>
              Deactivate Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data will be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Deleting your account will permanently remove:
            </p>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
              <li>Your profile and personal information</li>
              <li>All booking history</li>
              <li>All payment records</li>
              <li>All settings and preferences</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="delete-password">Current Password</Label>
              <Input
                id="delete-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <div>
              <Label htmlFor="delete-confirmation">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false)
                setCurrentPassword('')
                setDeleteConfirmation('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || !currentPassword}
            >
              Delete Account Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
