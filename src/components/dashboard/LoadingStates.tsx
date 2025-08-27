'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/loading-spinner'

interface DashboardLoadingProps {
  type?: 'page' | 'card' | 'list' | 'table' | 'form'
  message?: string
  className?: string
}

export function DashboardLoading({
  type = 'page',
  message = 'Loading...',
  className,
}: DashboardLoadingProps) {
  const renderLoadingContent = () => {
    switch (type) {
      case 'page':
        return (
          <div className="min-h-[400px] flex items-center justify-center">
            <LoadingSpinner size="lg" text={message} />
          </div>
        )

      case 'card':
        return (
          <Card className={className}>
            <CardHeader>
              <LoadingSkeleton lines={2} />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton lines={3} />
            </CardContent>
          </Card>
        )

      case 'list':
        return (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div
                        className="h-4 bg-muted rounded animate-pulse"
                        style={{ width: '60%' }}
                      />
                      <div
                        className="h-3 bg-muted rounded animate-pulse"
                        style={{ width: '40%' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      case 'table':
        return (
          <div className="space-y-2">
            {/* Table header skeleton */}
            <div className="flex space-x-4 p-4 border-b">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse flex-1" />
              ))}
            </div>
            {/* Table rows skeleton */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4 p-4 border-b">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-4 bg-muted rounded animate-pulse flex-1" />
                ))}
              </div>
            ))}
          </div>
        )

      case 'form':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <LoadingSkeleton lines={1} />
              <LoadingSkeleton lines={1} />
              <LoadingSkeleton lines={1} />
            </div>
            <div className="flex space-x-2">
              <div className="h-10 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        )

      default:
        return <LoadingSpinner text={message} />
    }
  }

  return renderLoadingContent()
}

interface SkeletonCardProps {
  className?: string
  showImage?: boolean
  showActions?: boolean
}

export function SkeletonCard({
  className,
  showImage = false,
  showActions = false,
}: SkeletonCardProps) {
  return (
    <Card className={className}>
      {showImage && <div className="h-48 bg-muted animate-pulse rounded-t-lg" />}
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="h-5 bg-muted rounded animate-pulse" style={{ width: '80%' }} />
          <div className="h-4 bg-muted rounded animate-pulse" style={{ width: '60%' }} />
          <div className="h-4 bg-muted rounded animate-pulse" style={{ width: '40%' }} />

          {showActions && (
            <div className="flex space-x-2 pt-2">
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface SkeletonListProps {
  count?: number
  className?: string
}

export function SkeletonList({ count = 6, className }: SkeletonListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showActions />
      ))}
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
  columns?: number
  className?: string
}

export function SkeletonGrid({ count = 6, columns = 3, className }: SkeletonGridProps) {
  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showImage showActions />
      ))}
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
}

export function LoadingOverlay({
  isLoading,
  children,
  message = 'Loading...',
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoadingSpinner text={message} />
      </div>
    </div>
  )
}

interface SuspenseFallbackProps {
  componentName?: string
}

export function SuspenseFallback({ componentName = 'Component' }: SuspenseFallbackProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-sm text-muted-foreground">Loading {componentName}...</p>
      </div>
    </div>
  )
}
