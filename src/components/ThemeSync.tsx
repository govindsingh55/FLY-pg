'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useSettings } from '@/hooks/useSettings'
import { useUser } from '@/lib/state/user'

/**
 * ThemeSync Component
 *
 * Syncs the user's saved theme preference with the Next.js theme
 * - Loads user's darkMode preference on mount
 * - Updates theme when preference changes
 * - Only applies for logged-in users
 */
export function ThemeSync() {
  const { setTheme } = useTheme()
  const { user } = useUser()
  const { data: settings } = useSettings()

  useEffect(() => {
    // Only apply saved preference if user is logged in
    if (!user) {
      return
    }

    // Apply user's saved theme preference
    if (settings?.preferences?.darkMode !== undefined) {
      setTheme(settings.preferences.darkMode ? 'dark' : 'light')
    }
  }, [settings?.preferences?.darkMode, user, setTheme])

  // This component renders nothing
  return null
}
