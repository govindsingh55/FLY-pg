'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/lib/state/user'
import { Building2, Home, Search, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFilterActions, useFilterState } from './FilterContext'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()
  const actions = useFilterActions()
  const navState = useFilterState()
  return (
    <nav className="fixed z-[100] inset-x-0 bottom-0 h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-full items-center justify-center px-4">
        <div className="flex w-full max-w-md items-center justify-around">
          <Link
            aria-label="Go to home"
            href={'/'}
            className={cn(
              'flex h-full w-full flex-col items-center justify-center gap-1 rounded-md py-2 text-xs hover:text-primary focus:text-primary',
              pathname === '/' && 'text-primary',
            )}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            aria-label="Go to properties"
            href="/properties"
            className={cn(
              'flex h-full w-full flex-col items-center justify-center gap-1 rounded-md py-2 text-xs hover:text-primary focus:text-primary',
              pathname === '/properties' && 'text-primary',
            )}
          >
            <Building2 className="h-5 w-5" />
            <span>Properties</span>
          </Link>
          <button
            aria-label="Open filter panel"
            onClick={() => {
              actions.toggleFilterPanel(true)
            }}
            className={cn(
              'flex h-full w-full flex-col items-center justify-center gap-1 rounded-md py-2 text-xs hover:text-primary focus:text-primary',
            )}
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>
          <Account />
        </div>
      </div>
    </nav>
  )
}

function Account() {
  const { isAuthenticated, logout } = useUser()
  const pathname = usePathname()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-md py-2 text-xs hover:text-primary focus:text-primary">
        <User className="h-5 w-5" />
        <span>Account</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-[200] gap-2 p-2">
        {isAuthenticated ? (
          <>
            <DropdownMenuItem className="border-b rounded-none">
              <Link href="/dashboard" className="text-lg">
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="border-b rounded-none">
              <Link href="/dashboard/profile" className="text-lg">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <button onClick={logout} className="text-lg">
                Logout
              </button>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem className="border-b rounded-none">
              <Link
                href={`/auth/sign-in${!pathname.startsWith('/auth') ? '?redirect=' + pathname : ''}`}
                className="text-lg"
              >
                Login
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/auth/sign-up" className="text-lg">
                Signup
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default BottomNav
