'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { StaffSidebarContent } from './StaffSidebarContent'
import { StaffThemeToggle } from './StaffThemeToggle'
import { ErrorBoundary } from '@/components/ui/error-boundary'

interface StaffDashboardLayoutProps {
  children: React.ReactNode
}

function StaffDashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isMobile } = useSidebar()

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Sidebar */}
      <Sidebar variant="floating" collapsible="icon" className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <div className="text-lg font-bold">FLY Staff</div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <StaffSidebarContent />
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2">
            <div className="flex items-center gap-2 rounded-lg border p-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">S</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Staff Member</p>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Mobile header */}
        {isMobile && (
          <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background px-4 shadow-sm">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Staff Dashboard</h1>
            </div>
            <StaffThemeToggle />
          </header>
        )}

        {/* Desktop header */}
        {!isMobile && (
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <StaffThemeToggle />
              <Button variant="ghost" size="lg" className="relative">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
            <div className="space-y-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function StaffDashboardLayout({ children }: StaffDashboardLayoutProps) {
  return (
    <ErrorBoundary>
      <StaffDashboardLayoutContent>{children}</StaffDashboardLayoutContent>
    </ErrorBoundary>
  )
}
