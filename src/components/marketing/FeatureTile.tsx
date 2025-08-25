'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { cn } from '../../lib/utils'
import { Button } from '../../components/ui/button'

export type FeatureTileProps = {
  id: string
  title: string
  subtitle?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  imageUrl: string
  accent?: 'peach' | 'pink' | 'mint' | 'blue'
  className?: string
}

export default function FeatureTile(props: FeatureTileProps) {
  const accentBg = useMemo(() => {
    switch (props.accent) {
      case 'peach':
        return 'bg-orange-50 dark:bg-orange-950/40 dark:border-orange-800/30'
      case 'pink':
        return 'bg-pink-50 dark:bg-pink-950/40 dark:border-pink-800/30'
      case 'mint':
        return 'bg-green-50 dark:bg-green-950/40 dark:border-green-800/30'
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800/30'
      default:
        return 'bg-muted/50 dark:bg-muted/30'
    }
  }, [props.accent])

  // Check if this is the first card (large card)
  const isLargeCard = props.className?.includes('row-span-2')

  if (isLargeCard) {
    // Special layout for the large card
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 dark:shadow-lg dark:hover:shadow-xl',
          accentBg,
          props.className,
        )}
      >
        <div className="flex flex-col h-full">
          {/* Image Section - Larger for the big card */}
          <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
            <img
              src={props.imageUrl}
              alt={props.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent dark:from-black/50" />
          </div>

          {/* Content Section - More spacious for the big card */}
          <div className="flex-1 p-8 flex flex-col">
            <div className="flex-1">
              {props.subtitle && (
                <p className="text-sm font-medium text-muted-foreground mb-3">{props.subtitle}</p>
              )}
              <h3 className="text-2xl font-bold mb-4 leading-tight">{props.title}</h3>
              {props.description && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {props.description}
                </p>
              )}
            </div>

            {/* CTA Button */}
            {props.ctaLabel && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <Button
                  asChild
                  size="default"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Link href={props.ctaHref ?? '#'}>{props.ctaLabel}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Original layout for smaller cards
  return (
    <div
      className={cn(
        'rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 dark:shadow-lg dark:hover:shadow-xl',
        accentBg,
        props.className,
      )}
    >
      <div className="grid md:grid-cols-2 gap-0">
        <div className="p-6">
          <p className="text-sm text-muted-foreground">{props.subtitle}</p>
          <h3 className="mt-1 text-2xl font-semibold">{props.title}</h3>
          {props.description ? (
            <p className="mt-2 text-muted-foreground">{props.description}</p>
          ) : null}
          {props.ctaLabel ? (
            <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href={props.ctaHref ?? '#'}>{props.ctaLabel}</Link>
            </Button>
          ) : null}
        </div>
        <div className="relative h-44 md:h-full">
          <img
            src={props.imageUrl}
            alt={props.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}
