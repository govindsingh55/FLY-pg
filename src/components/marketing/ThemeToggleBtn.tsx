'use client'

import * as React from 'react'
import * as Lucide from 'lucide-react'
import { useTheme } from 'next-themes'

export default function ThemeToggleBtn() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Derive isDark only after mount to avoid SSR/CSR mismatch
  const isDark = mounted ? theme === 'dark' : false

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
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
