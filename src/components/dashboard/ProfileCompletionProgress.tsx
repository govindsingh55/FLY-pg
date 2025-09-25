'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User,
  MapPin,
  Phone,
  Calendar,
  Briefcase,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface ProfileData {
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  occupation?: string
  company?: string
  profilePicture?: any
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  }
  emergencyContact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  notificationPreferences?: {
    emailNotifications?: boolean
    smsNotifications?: boolean
    pushNotifications?: boolean
    bookingReminders?: boolean
    paymentReminders?: boolean
    maintenanceUpdates?: boolean
  }
}

interface ProfileCompletionProgressProps {
  profile: ProfileData
  onCompleteProfile?: () => void
}

interface ProfileField {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isComplete: boolean
  isRequired: boolean
  editPath?: string
}

export function ProfileCompletionProgress({
  profile,
  onCompleteProfile,
}: ProfileCompletionProgressProps) {
  const getProfileFields = (): ProfileField[] => [
    {
      key: 'name',
      label: 'Full Name',
      icon: User,
      isComplete: !!profile.name?.trim(),
      isRequired: true,
      editPath: '/dashboard/profile',
    },
    {
      key: 'email',
      label: 'Email Address',
      icon: Mail,
      isComplete: !!profile.email?.trim(),
      isRequired: true,
      editPath: '/dashboard/profile',
    },
    {
      key: 'phone',
      label: 'Phone Number',
      icon: Phone,
      isComplete: !!profile.phone?.trim(),
      isRequired: true,
      editPath: '/dashboard/profile',
    },
    {
      key: 'profilePicture',
      label: 'Profile Picture',
      icon: User,
      isComplete: !!profile.profilePicture,
      isRequired: false,
      editPath: '/dashboard/profile',
    },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      icon: Calendar,
      isComplete: !!profile.dateOfBirth,
      isRequired: false,
      editPath: '/dashboard/profile',
    },
    {
      key: 'gender',
      label: 'Gender',
      icon: User,
      isComplete: !!profile.gender,
      isRequired: false,
      editPath: '/dashboard/profile',
    },
    {
      key: 'occupation',
      label: 'Occupation',
      icon: Briefcase,
      isComplete: !!profile.occupation?.trim(),
      isRequired: false,
      editPath: '/dashboard/profile',
    },
    {
      key: 'company',
      label: 'Company/Institution',
      icon: Briefcase,
      isComplete: !!profile.company?.trim(),
      isRequired: false,
      editPath: '/dashboard/profile',
    },
    {
      key: 'address',
      label: 'Address Information',
      icon: MapPin,
      isComplete: !!(
        profile.address?.street &&
        profile.address?.city &&
        profile.address?.state &&
        profile.address?.pincode
      ),
      isRequired: false,
      editPath: '/dashboard/profile',
    },
    {
      key: 'emergencyContact',
      label: 'Emergency Contact',
      icon: Phone,
      isComplete: !!(
        profile.emergencyContact?.name &&
        profile.emergencyContact?.phone &&
        profile.emergencyContact?.relationship
      ),
      isRequired: false,
      editPath: '/dashboard/profile',
    },
  ]

  const profileFields = getProfileFields()
  const requiredFields = profileFields.filter((field) => field.isRequired)
  const optionalFields = profileFields.filter((field) => !field.isRequired)

  const completedRequired = requiredFields.filter((field) => field.isComplete).length
  const completedOptional = optionalFields.filter((field) => field.isComplete).length

  const totalRequired = requiredFields.length
  const totalOptional = optionalFields.length

  const requiredProgress = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 100
  const optionalProgress = totalOptional > 0 ? (completedOptional / totalOptional) * 100 : 100
  const overallProgress =
    totalRequired + totalOptional > 0
      ? ((completedRequired + completedOptional) / (totalRequired + totalOptional)) * 100
      : 100

  const incompleteRequired = requiredFields.filter((field) => !field.isComplete)
  const incompleteOptional = optionalFields.filter((field) => !field.isComplete)

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-yellow-600'
    if (progress >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getProgressVariant = (progress: number) => {
    if (progress >= 80) return 'default'
    if (progress >= 60) return 'secondary'
    return 'destructive'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Completion
        </CardTitle>
        <CardDescription>Complete your profile to get the best experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className={`text-sm font-bold ${getProgressColor(overallProgress)}`}>
              {Math.round(overallProgress)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedRequired + completedOptional} of {totalRequired + totalOptional} fields
            completed
          </p>
        </div>

        {/* Required Fields Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Required Information</span>
            <Badge variant={getProgressVariant(requiredProgress)}>
              {completedRequired}/{totalRequired}
            </Badge>
          </div>
          <Progress value={requiredProgress} className="h-2" />

          {incompleteRequired.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Missing required fields:</p>
              <div className="space-y-1">
                {incompleteRequired.map((field) => (
                  <div key={field.key} className="flex items-center gap-2 text-xs">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">{field.label}</span>
                    {field.editPath && (
                      <Button variant="link" size="lg" className="h-auto p-0 text-xs" asChild>
                        <Link href={field.editPath}>
                          Complete <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Optional Fields Progress */}
        {totalOptional > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Additional Information</span>
              <Badge variant="secondary">
                {completedOptional}/{totalOptional}
              </Badge>
            </div>
            <Progress value={optionalProgress} className="h-2" />

            {incompleteOptional.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Optional fields to enhance your profile:
                </p>
                <div className="space-y-1">
                  {incompleteOptional.slice(0, 3).map((field) => (
                    <div key={field.key} className="flex items-center gap-2 text-xs">
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                      <span className="text-muted-foreground">{field.label}</span>
                      {field.editPath && (
                        <Button variant="link" size="lg" className="h-auto p-0 text-xs" asChild>
                          <Link href={field.editPath}>
                            Add <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  ))}
                  {incompleteOptional.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{incompleteOptional.length - 3} more optional fields
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4">
          {incompleteRequired.length > 0 ? (
            <Button asChild className="flex-1">
              <Link href="/dashboard/profile">Complete Required Fields</Link>
            </Button>
          ) : incompleteOptional.length > 0 ? (
            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard/profile">Enhance Profile</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Profile Complete!</span>
            </div>
          )}

          {onCompleteProfile && overallProgress < 100 && (
            <Button variant="outline" onClick={onCompleteProfile}>
              Complete Profile
            </Button>
          )}
        </div>

        {/* Profile Benefits */}
        {overallProgress < 100 && (
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Benefits of completing your profile:
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Faster booking process</li>
              <li>• Personalized recommendations</li>
              <li>• Better customer support</li>
              <li>• Access to exclusive offers</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
