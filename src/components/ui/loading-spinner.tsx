import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  variant?: 'default' | 'primary' | 'secondary'
}

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  variant = 'default',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  const variantClasses = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent',
            sizeClasses[size],
            variantClasses[variant],
          )}
        />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  )
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
    </div>
  )
}

export function LoadingSkeleton({ className, lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-muted"
          style={{
            width: `${Math.random() * 40 + 60}%`,
          }}
        />
      ))}
    </div>
  )
}
