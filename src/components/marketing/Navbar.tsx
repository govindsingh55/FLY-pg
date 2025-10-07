'use client'

import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Loader2 } from 'lucide-react'
import ThemeToggleBtn from './ThemeToggleBtn'
import { useUser } from '@/lib/state/user'
import { usePathname } from 'next/navigation'

/**
 * Navbar layout rules:
 * - Desktop (md+): 3 columns: left logo, center nav, right actions.
 * - Mobile (<md): single row with centered logo only. No hidden overlay row (prevents duplicate/tucked logo).
 */
export function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, status, logout } = useUser()
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      {/* Desktop grid */}
      <div className="mx-auto hidden max-w-8xl grid-cols-3 items-center px-4 py-3 md:grid">
        {/* Left: Logo (left aligned) */}
        <div className="col-span-1 flex justify-start">
          <Link
            href="/"
            className="text-4xl font-bold tracking-wide text-primary hover:text-primary/90"
            aria-label="Go to home"
          >
            FLY <span className="text-lg font-medium text-accent">colive</span>
          </Link>
        </div>

        {/* Center: Primary nav */}
        <nav className="flex items-center justify-center gap-6 text-md">
          <Link
            href="/#amenities"
            className="font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Amenities
          </Link>
          <Link
            href="/properties"
            className="font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Properties
          </Link>
          <Link
            href="/#community"
            className="font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Community
          </Link>
          <Link
            href="/about-us"
            className="font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            About Us
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
              <Link
                href={`/auth/sign-in${!pathname.startsWith('/auth') ? '?redirect=' + pathname : ''}`}
              >
                <Button variant="ghost" size="default">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button
                  size="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign up
                </Button>
              </Link>
            </>
          )}
          {status !== 'loading' && isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="default">
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="default" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile single row (only logo centered) */}
      <div className="mx-auto flex max-w-8xl items-center justify-between px-4 py-3 md:hidden">
        <Link
          href="/"
          className="text-4xl font-bold tracking-wide text-primary hover:text-primary/90"
          aria-label="Go to home"
        >
          FLY <span className="text-lg font-medium text-accent">colive</span>
        </Link>
        <ThemeToggleBtn />
      </div>
    </header>
  )
}

export default Navbar
