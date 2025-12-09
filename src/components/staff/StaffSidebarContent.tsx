'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Home, Ticket, LogOut, Calendar, Users, Building2 } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navigation = [
  { name: 'Dashboard', href: '/staff/dashboard', icon: Home },
  { name: 'Tickets', href: '/staff/tickets', icon: Ticket },
  { name: 'Bookings', href: '/staff/bookings', icon: Calendar },
  { name: 'Customers', href: '/staff/customers', icon: Users },
  { name: 'Properties', href: '/staff/properties', icon: Building2 },
]

export function StaffSidebarContent() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (res.ok) {
          const data = await res.json()
          setUserRole(data?.user?.role || null)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/custom/staff/logout', { method: 'POST' })
      toast.success('Logged out successfully!')
      router.push('/staff/login')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to log out.')
    }
  }

  const filteredNavigation = navigation.filter((item) => {
    if (['Bookings', 'Customers', 'Properties'].includes(item.name)) {
      return userRole === 'manager' || userRole === 'admin'
    }
    return true
  })

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Staff Portal</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {filteredNavigation.map((item) => {
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
        <SidebarGroupLabel>Account</SidebarGroupLabel>
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
