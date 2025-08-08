import React from 'react'
import './styles.css'
import { ThemeProvider } from '../../components/theme-provider'
import Filters from '@/components/marketing/Filters'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import { BottomNav } from '@/components/marketing/components'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <BottomNav />
            <Filters />
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  )
}
