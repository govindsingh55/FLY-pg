'use client'

import React from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/marketing/Navbar'
import { BottomNav } from '@/components/marketing/BottomNav'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md py-10">{children}</div>
      </div>
      <div className="border-t py-6 text-center text-sm text-muted-foreground">
        By continuing, you agree to our{' '}
        <Link href="#" className="underline underline-offset-4">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="#" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </div>
      <BottomNav />
    </div>
  )
}
