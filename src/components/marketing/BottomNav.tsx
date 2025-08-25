'use client'

import { Building2, Home, Search, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFilterActions } from './FilterContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/lib/state/user'

export function BottomNav() {
  const pathname = usePathname()
  const actions = useFilterActions()

  return (
    <nav className="fixed z-[100] inset-x-0 bottom-0 h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-full items-center justify-center px-4">
        <div className="flex w-full max-w-md items-center justify-around">
          {pathname !== '/' ? (
            <Link
              href={'/'}
              className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-md py-2 text-xs hover:text-primary focus:text-primary"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
          ) : null}
          {pathname !== '/properties' ? (
            <Link
              href="/properties"
              className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-md py-2 text-xs hover:text-primary focus:text-primary"
            >
              <Building2 className="h-5 w-5" />
              <span>Properties</span>
            </Link>
          ) : null}
          <button
            onClick={() => {
              actions.toggleFilterPanel(true)
            }}
            className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-md py-2 text-xs hover:text-primary focus:text-primary"
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
  const { isAuthenticated, status, logout } = useUser()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-md py-2 text-xs hover:text-primary focus:text-primary">
        <User className="h-5 w-5" />
        <span>Account</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-[200] gap-1">
        {isAuthenticated ? (
          <>
            <DropdownMenuItem>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem>
              <Link href="/auth/sign-in">Login</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/auth/sign-up">Signup</Link>
            </DropdownMenuItem>
          </>
        )}
        {isAuthenticated && (
          <DropdownMenuItem>
            <button onClick={logout}>Logout</button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default BottomNav
