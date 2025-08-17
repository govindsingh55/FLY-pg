import React, { Suspense } from 'react'
import './styles.css'
import { ThemeProvider } from '../../components/theme-provider'
import { UserProvider } from '@/lib/state/user'
import Filters from '@/components/marketing/Filters'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import { BottomNav } from '@/components/marketing/components'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import { FilterProvider } from '@/components/marketing/FilterContext'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <Suspense>
              <NuqsAdapter>
                <FilterProvider>
                  <Navbar />
                  {/* Main site content: no vertical centering so pages can scroll naturally */}
                  <main className="flex-1 flex flex-col w-full justify-start items-stretch">
                    {children}
                  </main>
                  <Footer />
                  <BottomNav />
                  <Filters />
                </FilterProvider>
              </NuqsAdapter>
            </Suspense>
          </UserProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
