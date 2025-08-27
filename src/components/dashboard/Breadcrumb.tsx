'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbProps {
  className?: string
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const pathname = usePathname()

  // Skip breadcrumb for root dashboard
  if (pathname === '/dashboard') return null

  const segments = pathname.split('/').filter(Boolean).slice(1) // Remove 'dashboard' from the start

  const breadcrumbItems = segments.map((segment, index) => {
    const href = `/dashboard/${segments.slice(0, index + 1).join('/')}`
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      label,
      href,
      isLast: index === segments.length - 1,
    }
  })

  return (
    <nav
      className={cn(
        'flex items-center space-x-1 text-sm text-muted-foreground overflow-x-auto',
        className,
      )}
    >
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors flex-shrink-0"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          {item.isLast ? (
            <span className="text-foreground font-medium flex-shrink-0">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors flex-shrink-0"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
