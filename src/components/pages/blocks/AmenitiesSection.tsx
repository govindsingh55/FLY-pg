import React from 'react'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

interface Amenity {
  name: string
  icon?: unknown
  description?: string
}

interface AmenitiesSectionProps {
  title: string
  subtitle?: string
  amenities: Amenity[]
  columns?: '2' | '3' | '4' | '5'
  // Enhanced styling options
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  showBorder?: boolean
}

export function AmenitiesSection({
  title,
  subtitle,
  amenities,
  columns = '4',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
  showBorder = false,
}: AmenitiesSectionProps) {
  const gridCols = {
    '2': 'grid-cols-2',
    '3': 'grid-cols-2 sm:grid-cols-3',
    '4': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    '5': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  }

  const backgroundStyles = {
    transparent: 'bg-transparent',
    background: 'bg-background',
    muted: 'bg-muted',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
  }

  const textAlignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const paddingStyles = {
    small: 'py-8',
    default: 'py-16',
    large: 'py-20',
    xl: 'py-24',
  }

  const maxWidthStyles = {
    narrow: 'max-w-2xl',
    default: 'max-w-6xl',
    wide: 'max-w-8xl',
    full: 'max-w-none',
  }

  const borderStyles = showBorder ? 'border border-border rounded-lg' : ''

  return (
    <section className={`${paddingStyles[padding]} px-4 ${backgroundStyles[backgroundColor]}`}>
      <div className={`${maxWidthStyles[maxWidth]} mx-auto`}>
        {showBorder ? (
          <div className={borderStyles}>
            <div className="p-8">
              <div className={`${textAlignStyles[textAlignment]} mb-12`}>
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                {subtitle && (
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
                )}
              </div>

              <div className={`grid gap-2 ${gridCols[columns]}`}>
                {amenities.map((amenity, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center gap-2">
                      {amenity.icon !== null && amenity.icon !== undefined && (
                        <div className="w-4 h-4 flex-shrink-0">
                          <Image
                            src={
                              typeof amenity.icon === 'object' &&
                              amenity.icon !== null &&
                              'url' in amenity.icon
                                ? (amenity.icon as { url: string }).url
                                : (amenity.icon as string)
                            }
                            alt={amenity.name}
                            width={16}
                            height={16}
                            className="w-full h-full object-contain text-primary"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="text-sm font-medium">{amenity.name}</span>
                        {amenity.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {amenity.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={`${textAlignStyles[textAlignment]} mb-12`}>
              <h2 className="text-3xl font-bold mb-4">{title}</h2>
              {subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
              )}
            </div>

            <div className={`grid gap-2 ${gridCols[columns]}`}>
              {amenities.map((amenity, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center gap-2">
                    {amenity.icon !== null && amenity.icon !== undefined && (
                      <div className="w-4 h-4 flex-shrink-0">
                        <Image
                          src={
                            typeof amenity.icon === 'object' &&
                            amenity.icon !== null &&
                            'url' in amenity.icon
                              ? (amenity.icon as { url: string }).url
                              : (amenity.icon as string)
                          }
                          alt={amenity.name}
                          width={16}
                          height={16}
                          className="w-full h-full object-contain text-primary"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <span className="text-sm font-medium">{amenity.name}</span>
                      {amenity.description && (
                        <p className="text-xs text-muted-foreground mt-1">{amenity.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
