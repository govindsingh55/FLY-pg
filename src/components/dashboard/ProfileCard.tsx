'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

interface ProfileCardProps {
  profile: {
    id: string
    name: string
    email: string
    phone?: string
    status?: string
    createdAt?: string
    updatedAt?: string
    avatar?: {
      id: string
      url: string
      alt?: string
    }
  }
  showActions?: boolean
}

export function ProfileCard({ profile, showActions = true }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Your personal details and account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and basic info */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar?.url} alt={profile.avatar?.alt || profile.name} />
            <AvatarFallback className="text-lg">
              {profile.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                {profile.status || 'Active'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contact information */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Account details */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Account Details</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Member since:{' '}
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Last updated:{' '}
                {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings">
                <MapPin className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
