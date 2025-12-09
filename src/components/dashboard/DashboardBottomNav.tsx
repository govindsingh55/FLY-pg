'use client'

import { LayoutDashboard, Receipt, Ticket, Calendar } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function DashboardBottomNav() {
  const pathname = usePathname()

  const links = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      href: '/dashboard/bookings',
      label: 'Bookings',
      icon: Calendar,
      active: pathname?.startsWith('/dashboard/bookings'),
    },
    {
      href: '/dashboard/rent',
      label: 'Rent',
      icon: Receipt,
      active: pathname?.startsWith('/dashboard/rent'),
    },
    {
      href: '/dashboard/support',
      label: 'Support',
      icon: Ticket,
      active: pathname?.startsWith('/dashboard/support'),
    },
  ]

  return (
    <nav className="fixed z-100 inset-x-0 bottom-0 h-16 bg-background border-t md:hidden">
      <div className="grid h-full grid-cols-4 mx-auto font-medium">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 group',
                link.active && 'text-primary',
                !link.active && 'text-muted-foreground',
              )}
            >
              <Icon className={cn('w-6 h-6 mb-1', link.active && 'text-primary')} />
              <span className="text-xs">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
