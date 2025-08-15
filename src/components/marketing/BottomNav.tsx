'use client'

import * as Lucide from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useFilterActions } from './FilterContext'

export function BottomNav() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = theme === 'dark'
  const items: {
    key: string
    label: string
    icon: React.ElementType
    onClick?: () => void
    href?: string
  }[] = [
    { key: 'home', label: 'Home', icon: Lucide.Home, href: '#top' },
    { key: 'search', label: 'Search', icon: Lucide.Search },
    { key: 'user', label: 'Account', icon: Lucide.User, href: '#login' },
    { key: 'theme', label: 'Theme', icon: Lucide.Moon },
  ]
  const actions = useFilterActions()
  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
        <ul className="mx-auto grid max-w-6xl grid-cols-4 px-2 py-2 text-xs">
          {items.map((it) => (
            <li key={it.key} className="flex items-center justify-center">
              {it.key === 'search' ? (
                <button
                  onClick={() => {
                    actions.toggleFilterPanel(true)
                  }}
                  className="flex flex-col items-center gap-1 rounded-md px-2 py-1.5 hover:text-primary"
                >
                  <it.icon className="size-5" />
                  <span>{it.label}</span>
                </button>
              ) : it.key === 'theme' ? (
                <button
                  onClick={() => {
                    // Avoid SSR/CSR mismatch by only toggling after mount
                    if (!mounted) return
                    setTheme(isDark ? 'light' : 'dark')
                  }}
                  className="flex flex-col items-center gap-1 rounded-md px-2 py-1.5 hover:text-primary"
                >
                  <span aria-hidden suppressHydrationWarning>
                    {mounted ? (
                      isDark ? (
                        <Lucide.Moon className="size-5" />
                      ) : (
                        <Lucide.Sun className="size-5" />
                      )
                    ) : (
                      // Stable placeholder during SSR to prevent hydration mismatch
                      <Lucide.Moon className="size-5" />
                    )}
                  </span>
                  <span>{it.label}</span>
                </button>
              ) : (
                <a
                  href={it.href}
                  className="flex flex-col items-center gap-1 rounded-md px-2 py-1.5 hover:text-primary"
                >
                  <it.icon className="size-5" />
                  <span>{it.label}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

export default BottomNav
