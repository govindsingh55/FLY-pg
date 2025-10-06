import React from 'react'
import { AmenityDisplay } from './AmenityDisplay'
import { Marquee } from './marquee'
import type { Amenity } from '@/payload/payload-types'
import { cn } from '@/lib/utils'

interface AmenityMarqueeProps {
  amenities: (string | Amenity)[]
  showDescription?: boolean
  showIcon?: boolean
  className?: string
  itemClassName?: string
  maxItems?: number
  variant?: 'default' | 'compact' | 'detailed'
  emptyMessage?: string
  pauseOnHover?: boolean
  reverse?: boolean
  vertical?: boolean
  repeat?: number
  duration?: string
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
  pauseOnHover = true,
  reverse = false,
  vertical = false,
  repeat = 4,
  duration = '40s',
}) => {
  const displayAmenities = maxItems ? amenities.slice(0, maxItems) : amenities

  if (!displayAmenities.length) {
    return (
      <div className={cn('text-center text-muted-foreground py-8', className)}>{emptyMessage}</div>
    )
  }

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <Marquee
        pauseOnHover={pauseOnHover}
        reverse={reverse}
        vertical={vertical}
        repeat={repeat}
        className={cn('py-2', `[--duration:${duration}]`)}
      >
        {displayAmenities.map((item, index) => {
          const amenity =
            typeof item === 'string'
              ? ({
                  id: `amenity-${index}`,
                  name: item,
                  iconName: 'CheckCircle',
                  description: '',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as Amenity)
              : item

          return (
            <div
              key={amenity.id}
              className={cn(
                'flex flex-col items-center justify-center gap-1 md:gap-2 rounded-lg border border-accent/35 bg-card px-3 py-4 text-center shadow-sm transition-all duration-200 hover:shadow-md hover:border-2 hover:border-accent hover:bg-accent/5 w-32 min-w-32 md:w-36 md:min-w-36 flex-shrink-0 mx-1 md:mx-2',
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
          )
        })}
      </Marquee>

      {/* Gradient fade effects with better coverage */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent"></div>
    </div>
  )
}
