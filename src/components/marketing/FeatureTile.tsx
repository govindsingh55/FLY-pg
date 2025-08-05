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
        return 'bg-cream'
      case 'pink':
        return 'bg-plum/10'
      case 'mint':
        return 'bg-sage/20'
      default:
        return 'bg-accent/10'
    }
  }, [props.accent])

  return (
    <div className={cn('rounded-2xl border overflow-hidden', accentBg, props.className)}>
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
