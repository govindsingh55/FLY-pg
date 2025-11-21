import React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { StaffDashboardLayout } from '@/components/staff/StaffDashboardLayout'

export default function StaffPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <StaffDashboardLayout>{children}</StaffDashboardLayout>
    </SidebarProvider>
  )
}
