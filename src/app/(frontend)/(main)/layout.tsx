import { FilterProvider } from '@/components/marketing/FilterContext'
import Filters from '@/components/marketing/Filters'
import Footer from '@/components/marketing/Footer'
import Navbar from '@/components/marketing/Navbar'
import { BottomNav } from '@/components/marketing/components'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import React, { Suspense } from 'react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <NuqsAdapter>
        <FilterProvider>
          <Navbar />
          {/* Main site content: no vertical centering so pages can scroll naturally */}
          <main className="flex-1 w-full mx-auto max-w-8xl">{children}</main>
          <Footer />
          <BottomNav />
          <Filters />
        </FilterProvider>
      </NuqsAdapter>
    </Suspense>
  )
}
