import React from 'react'
import { AmenityDisplay } from './AmenityDisplay'
import type { Amenity } from '@/payload/payload-types'
import { cn } from '@/lib/utils'

interface AmenityGridProps {
  amenities: Amenity[]
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  showDescription?: boolean
  showIcon?: boolean
  className?: string
  itemClassName?: string
  maxItems?: number
  variant?: 'default' | 'compact' | 'detailed'
  emptyMessage?: string
}

export const AmenityGrid: React.FC<AmenityGridProps> = ({
  amenities,
  columns = 3,
  showDescription = false,
  showIcon = true,
  className,
  itemClassName,
  maxItems,
  variant = 'default',
  emptyMessage = 'No amenities available',
}) => {
  const displayAmenities = maxItems ? amenities.slice(0, maxItems) : amenities

  if (!displayAmenities.length) {
    return (
      <div className={cn('text-center text-muted-foreground py-8', className)}>{emptyMessage}</div>
    )
  }

  const gridCols = {
    1: 'grid-cols-2',
    2: 'grid-cols-2 sm:grid-cols-3',
    3: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6',
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className={cn('grid gap-4', gridCols[columns])}>
        {displayAmenities.map((amenity) => (
          <div
            key={amenity.id}
            className={cn(
              'p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:-translate-y-1',
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
        ))}
      </div>

      {maxItems && amenities.length > maxItems && (
        <div className="text-center">
          <button className="text-sm text-primary hover:underline">
            View all {amenities.length} amenities
          </button>
        </div>
      )}
    </div>
  )
}
