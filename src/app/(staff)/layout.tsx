import React from 'react'
import '../(frontend)/styles.css'
import { ThemeProvider } from '../../components/theme-provider'
import { QueryProvider } from '@/lib/query-provider'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  description: 'FLY Staff Portal - Manage support tickets and operations',
  title: 'FLY Staff Portal',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function StaffRootLayout(props: { children: React.ReactNode }) {
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
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
