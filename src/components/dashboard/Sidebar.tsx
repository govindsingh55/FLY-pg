'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUser } from '@/lib/state/user'
import { Home, User, Calendar, CreditCard, Settings, LogOut, X, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onClose?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Rent & Payments', href: '/dashboard/rent', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useUser()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="text-lg lg:text-xl font-bold">FLY Dashboard</div>
        </Link>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 lg:px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              onClick={onClose}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-3 lg:p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={onClose}
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
