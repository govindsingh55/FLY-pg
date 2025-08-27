import React, { Suspense } from 'react'
import Filters from '@/components/marketing/Filters'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import { BottomNav } from '@/components/marketing/components'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { FilterProvider } from '@/components/marketing/FilterContext'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
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
  )
}
