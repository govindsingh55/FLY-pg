import React from 'react'
import IconByName from '@/components/marketing/IconByName'
import type { Amenity } from '@/payload/payload-types'
import { cn } from '@/lib/utils'

interface AmenityDisplayProps {
  amenity: Amenity
  showDescription?: boolean
  showIcon?: boolean
  className?: string
  iconClassName?: string
  nameClassName?: string
  descriptionClassName?: string
  variant?: 'default' | 'compact' | 'detailed'
}

export const AmenityDisplay: React.FC<AmenityDisplayProps> = ({
  amenity,
  showDescription = false,
  showIcon = true,
  className,
  iconClassName,
  nameClassName,
  descriptionClassName,
  variant = 'default',
}) => {
  const iconName = amenity.iconName || 'Package' // Default fallback icon
  const displayName = amenity.name || 'Unknown Amenity'
  const description = amenity.description || `This property offers ${amenity.name}`

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center justify-center gap-2 px-2', className)}>
        {showIcon && (
          <IconByName
            name={iconName}
            className={cn('h-4 w-4 text-muted-foreground flex-shrink-0', iconClassName)}
          />
        )}
        <span className={cn('text-sm font-medium text-nowrap whitespace-nowrap', nameClassName)}>
          {displayName}
        </span>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-center gap-2">
          {showIcon && (
            <IconByName name={iconName} className={cn('h-5 w-5 text-primary', iconClassName)} />
          )}
          <h4
            className={cn(
              'font-semibold text-foreground text-nowrap whitespace-nowrap',
              nameClassName,
            )}
          >
            {displayName}
          </h4>
        </div>
        {showDescription && (
          <p className={cn('text-sm text-muted-foreground', descriptionClassName)}>{description}</p>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {showIcon && (
        <IconByName name={iconName} className={cn('h-5 w-5 text-primary', iconClassName)} />
      )}
      <div className="flex flex-col">
        <span className={cn('font-medium text-foreground', nameClassName)}>{displayName}</span>
        {showDescription && (
          <span className={cn('text-sm text-muted-foreground', descriptionClassName)}>
            {description}
          </span>
        )}
      </div>
    </div>
  )
}

interface AmenityListProps {
  amenities: Amenity[]
  variant?: 'default' | 'compact' | 'detailed'
  showDescription?: boolean
  showIcon?: boolean
  className?: string
  itemClassName?: string
  maxItems?: number
}

export const AmenityList: React.FC<AmenityListProps> = ({
  amenities,
  variant = 'default',
  showDescription = false,
  showIcon = true,
  className,
  itemClassName,
  maxItems,
}) => {
  const displayAmenities = maxItems ? amenities.slice(0, maxItems) : amenities

  if (!displayAmenities.length) {
    return (
      <div className={cn('text-center text-muted-foreground py-4', className)}>
        No amenities available
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {displayAmenities.map((amenity) => (
        <AmenityDisplay
          key={amenity.id}
          amenity={amenity}
          variant={variant}
          showDescription={showDescription}
          showIcon={showIcon}
          className={itemClassName}
        />
      ))}
      {maxItems && amenities.length > maxItems && (
        <div className="text-sm text-muted-foreground text-center">
          +{amenities.length - maxItems} more amenities
        </div>
      )}
    </div>
  )
}
