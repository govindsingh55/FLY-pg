import React from 'react'
import './styles.css'
import { ThemeProvider } from '../../components/theme-provider'
import { ThemeSync } from '@/components/ThemeSync'
import { UserProvider } from '@/lib/state/user'
import { QueryProvider } from '@/lib/query-provider'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  description: 'FLY colive - Your Stay. Your Way. Premium property rental platform.',
  title: 'FLY colive - Property Rental Platform',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen relative flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <UserProvider>
              <ThemeSync />
              {children}
            </UserProvider>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
