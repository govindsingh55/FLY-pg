'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/state/user'
import { logoutAction } from '@/app/(frontend)/(main)/auth/auth-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Home,
  User,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
} from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Rent & Payments', href: '/dashboard/rent', icon: CreditCard },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Support', href: '/dashboard/support', icon: MessageSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebarContent() {
  const pathname = usePathname()
  const { user, logout } = useUser()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutAction()
      await logout()
      toast.success('Logged out successfully!')
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to log out.')
    }
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="text-destructive hover:text-destructive"
              >
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
