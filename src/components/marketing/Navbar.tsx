'use client'

import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Loader2 } from 'lucide-react'
import ThemeToggleBtn from './ThemeToggleBtn'
import { useUser } from '@/lib/state/user'

/**
 * Navbar layout rules:
 * - Desktop (md+): 3 columns: left logo, center nav, right actions.
 * - Mobile (<md): single row with centered logo only. No hidden overlay row (prevents duplicate/tucked logo).
 */
export function Navbar() {
  const { isAuthenticated, status, logout } = useUser()
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      {/* Desktop grid */}
      <div className="mx-auto hidden max-w-6xl grid-cols-3 items-center px-4 py-3 md:grid">
        {/* Left: Logo (left aligned) */}
        <div className="col-span-1 flex justify-start">
          <a
            href="/"
            className="text-xl font-bold tracking-wide hover:text-primary"
            aria-label="Go to home"
          >
            FLY
          </a>
        </div>

        {/* Center: Primary nav */}
        <nav className="flex items-center justify-center gap-6 text-sm">
          <Link href="#amenities" className="hover:text-primary">
            Amenities
          </Link>
          <Link href="/properties" className="hover:text-primary">
            Properties
          </Link>
          <Link href="#community" className="hover:text-primary">
            Community
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2">
          <ThemeToggleBtn />
          {status === 'loading' && (
            <div className="h-9 w-9 inline-flex items-center justify-center rounded-md border">
              <Loader2
                className="h-4 w-4 animate-spin text-muted-foreground"
                aria-label="Loading session"
              />
              <span className="sr-only">Loading session...</span>
            </div>
          )}
          {status !== 'loading' && !isAuthenticated && (
            <>
              <Link href="/auth/sign-in">
                <Button asChild variant="ghost">
                  <span>Sign in</span>
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <span>Sign up</span>
                </Button>
              </Link>
            </>
          )}
          {status !== 'loading' && isAuthenticated && (
            <Button asChild variant="ghost" onClick={logout}>
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile single row (only logo centered) */}
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-3 md:hidden">
        <a
          href="/"
          className="text-xl font-bold tracking-wide hover:text-primary"
          aria-label="Go to home"
        >
          FLY
        </a>
      </div>
    </header>
  )
}

export default Navbar
