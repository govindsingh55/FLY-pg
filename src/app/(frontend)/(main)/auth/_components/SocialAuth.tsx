'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.96h5.56c-.24 1.26-1.68 3.7-5.56 3.7-3.35 0-6.08-2.77-6.08-6.2S8.65 5.46 12 5.46c1.91 0 3.2.82 3.94 1.53l2.68-2.58C16.86 2.88 14.62 2 12 2 6.9 2 2.76 6.15 2.76 11.26S6.9 20.52 12 20.52c6.93 0 9.23-4.84 9.23-7.32 0-.49-.05-.86-.11-1.24H12z"
      />
      <path fill="none" d="M2 2h20v20H2z" />
    </svg>
  )
}

export function OrDivider() {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
      </div>
    </div>
  )
}

export function SocialAuthButton({
  onClick,
  children = 'Continue with Google',
}: {
  onClick?: () => void
  children?: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onClick}
      aria-label="Continue with Google"
    >
      <GoogleIcon className="size-4" />
      <span>{children}</span>
    </Button>
  )
}
