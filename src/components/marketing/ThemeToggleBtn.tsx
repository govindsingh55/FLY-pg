'use client'
import { useEffect, useState } from 'react'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useUser } from '@/lib/state/user'
import { Button } from '../ui/button'

export default function ThemeToggleBtn() {
  const { setTheme, resolvedTheme } = useTheme()
  const { user } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <Button size="sm" aria-label="Toggle theme" variant="outline">
        <Sun className="size-4" />
        <span className="hidden sm:inline">Light</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

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
    <Button size="sm" aria-label="Toggle theme" onClick={handleToggle} variant="outline">
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      <span className="hidden lg:inline">{isDark ? 'Dark' : 'Light'}</span>
    </Button>
  )
}
