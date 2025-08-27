import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { SessionMonitor } from '@/components/dashboard/SessionMonitor'
import { SidebarProvider } from '@/components/ui/sidebar'
import { RequireAuth } from '@/lib/state/user'
import React, { Suspense } from 'react'

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth redirectTo="/auth/sign-in">
      <SidebarProvider defaultOpen={true}>
        <SessionMonitor redirectTo="/auth/sign-in" />
        <DashboardLayout>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </DashboardLayout>
      </SidebarProvider>
    </RequireAuth>
  )
}
