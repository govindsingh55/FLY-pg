'use client'

import * as React from 'react'
import * as Lucide from 'lucide-react'
import { useTheme } from 'next-themes'
import { useUser } from '@/lib/state/user'

export default function ThemeToggleBtn() {
  const { theme, setTheme } = useTheme()
  const { user } = useUser()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Derive isDark only after mount to avoid SSR/CSR mismatch
  const isDark = mounted ? theme === 'dark' : false

  const handleToggle = async () => {
    const newTheme = isDark ? 'light' : 'dark'
    setTheme(newTheme)

    // Also update user's preference if logged in
    if (user) {
      try {
        await fetch('/api/custom/customers/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: {
              darkMode: newTheme === 'dark',
            },
          }),
        })
      } catch (error) {
        // Silent fail - theme is still applied locally
        console.error('Failed to save theme preference:', error)
      }
    }
  }

  return (
    <button
      aria-label="Toggle theme"
      onClick={handleToggle}
      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-md hover:bg-muted"
      suppressHydrationWarning
    >
      {/* Stable SSR placeholder; real icon after mount */}
      {mounted ? (
        isDark ? (
          <Lucide.Moon className="size-4" />
        ) : (
          <Lucide.Sun className="size-4" />
        )
      ) : (
        <span className="size-4 inline-block" />
      )}
      <span className="hidden sm:inline" suppressHydrationWarning>
        {mounted ? (isDark ? 'Dark' : 'Light') : 'Light'}
      </span>
    </button>
  )
}
