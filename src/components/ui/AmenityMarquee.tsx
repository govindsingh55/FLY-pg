import React from 'react'
import { AmenityDisplay } from './AmenityDisplay'
import { Marquee, MarqueeContent, MarqueeFade, MarqueeItem } from './marquee'
import type { Amenity } from '@/payload/payload-types'
import { cn } from '@/lib/utils'

interface AmenityMarqueeProps {
  amenities: Amenity[]
  showDescription?: boolean
  showIcon?: boolean
  className?: string
  itemClassName?: string
  maxItems?: number
  variant?: 'default' | 'compact' | 'detailed'
  emptyMessage?: string
  speed?: number
  pauseOnHover?: boolean
}

export const AmenityMarquee: React.FC<AmenityMarqueeProps> = ({
  amenities,
  showDescription = false,
  showIcon = true,
  className,
  itemClassName,
  maxItems,
  variant = 'default',
  emptyMessage = 'No amenities available',
  speed = 30,
  pauseOnHover = true,
}) => {
  const displayAmenities = maxItems ? amenities.slice(0, maxItems) : amenities

  if (!displayAmenities.length) {
    return (
      <div className={cn('text-center text-muted-foreground py-8', className)}>{emptyMessage}</div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <Marquee className="py-2">
        <MarqueeContent
          speed={speed}
          pauseOnHover={pauseOnHover}
          loop={0}
          autoFill={true}
          className="py-2"
        >
          <MarqueeFade side="left" />
          <MarqueeFade side="right" />

          {displayAmenities.map((amenity) => (
            <MarqueeItem key={amenity.id}>
              <div
                className={cn(
                  'px-6 py-3 rounded-full border bg-card hover:bg-accent/50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:-translate-y-1',
                  itemClassName,
                )}
              >
                <AmenityDisplay
                  amenity={amenity}
                  variant={variant}
                  showDescription={showDescription}
                  showIcon={showIcon}
                />
              </div>
            </MarqueeItem>
          ))}
        </MarqueeContent>
      </Marquee>
    </div>
  )
}
