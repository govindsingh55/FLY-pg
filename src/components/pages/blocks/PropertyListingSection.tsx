'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Users, Wifi, Car, Utensils, Dumbbell, Shield, WashingMachine } from 'lucide-react'
import Link from 'next/link'
import type { Media } from '@/payload/payload-types'

interface PropertyListingSectionProps {
  title: string
  subtitle?: string
  description?: string
  showAllProperties?: boolean
  selectedProperties?: string[]
  maxProperties?: number
  layout?: 'grid' | 'list' | 'masonry'
  columns?: '2' | '3' | '4'
  _showFilters?: boolean
  _showPagination?: boolean
  showViewAllButton?: boolean
  viewAllButtonText?: string
  viewAllButtonUrl?: string
  backgroundColor?: string
  textAlignment?: string
  padding?: string
  maxWidth?: string
}

interface ProcessedProperty {
  id: string
  name: string
  slug: string
  propertyType: string
  genderType: string
  address: {
    location: {
      city: string
      state: string
    }
  }
  images?: Array<{
    image?: Media
    isCover?: boolean
  }>
  rooms?: Array<{
    rent: number
    roomType: string
  }>
  amenities?: Array<{
    name: string
    icon?: Media
  }>
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  parking: Car,
  food: Utensils,
  gym: Dumbbell,
  security: Shield,
  laundry: WashingMachine,
}

export function PropertyListingSection({
  title,
  subtitle,
  description,
  showAllProperties = true,
  selectedProperties = [],
  maxProperties = 6,
  layout = 'grid',
  columns = '3',
  _showFilters = false,
  _showPagination = false,
  showViewAllButton = true,
  viewAllButtonText = 'View All Properties',
  viewAllButtonUrl = '/properties',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
}: PropertyListingSectionProps) {
  const [properties, setProperties] = useState<ProcessedProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const params = new URLSearchParams({
          limit: maxProperties.toString(),
          showAll: showAllProperties.toString(),
        })

        if (!showAllProperties && selectedProperties.length > 0) {
          params.set('ids', selectedProperties.join(','))
        }

        const response = await fetch(`/api/custom/properties?${params}`)
        const data = await response.json()

        if (data.success) {
          setProperties(data.properties)
        } else {
          console.error('Error fetching properties:', data.error)
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [showAllProperties, selectedProperties, maxProperties])

  const getBackgroundClass = () => {
    switch (backgroundColor) {
      case 'primary':
        return 'bg-primary text-primary-foreground'
      case 'secondary':
        return 'bg-secondary text-secondary-foreground'
      case 'muted':
        return 'bg-muted text-muted-foreground'
      case 'background':
        return 'bg-background text-foreground'
      default:
        return 'bg-transparent text-foreground'
    }
  }

  const getPaddingClass = () => {
    switch (padding) {
      case 'small':
        return 'py-8'
      case 'large':
        return 'py-16'
      case 'xl':
        return 'py-20'
      default:
        return 'py-12'
    }
  }

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'narrow':
        return 'max-w-4xl'
      case 'wide':
        return 'max-w-7xl'
      case 'full':
        return 'max-w-none'
      default:
        return 'max-w-6xl'
    }
  }

  const getTextAlignClass = () => {
    switch (textAlignment) {
      case 'left':
        return 'text-left'
      case 'right':
        return 'text-right'
      default:
        return 'text-center'
    }
  }

  const getGridClass = () => {
    if (layout === 'list') return 'grid-cols-1'
    if (layout === 'masonry') return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

    switch (columns) {
      case '2':
        return 'grid-cols-1 md:grid-cols-2'
      case '4':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  const getPropertyImage = (property: ProcessedProperty) => {
    const coverImage = property.images?.find((img) => img.isCover)?.image
    const firstImage = property.images?.[0]?.image
    return coverImage || firstImage
  }

  const getMinRent = (property: ProcessedProperty) => {
    if (!property.rooms || property.rooms.length === 0) return null
    return Math.min(...property.rooms.map((room) => room.rent))
  }

  const getMaxRent = (property: ProcessedProperty) => {
    if (!property.rooms || property.rooms.length === 0) return null
    return Math.max(...property.rooms.map((room) => room.rent))
  }

  const getRoomTypes = (property: ProcessedProperty) => {
    if (!property.rooms) return []
    const types = [...new Set(property.rooms.map((room) => room.roomType))]
    return types
  }

  const renderPropertyCard = (property: ProcessedProperty) => {
    const image = getPropertyImage(property)
    const minRent = getMinRent(property)
    const maxRent = getMaxRent(property)
    const roomTypes = getRoomTypes(property)

    if (layout === 'list') {
      return (
        <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3">
              <div className="relative h-48 md:h-full">
                <img
                  src={image?.url || 'https://picsum.photos/400/300'}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">{property.propertyType}</Badge>
                </div>
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {property.address.location.city}, {property.address.location.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{property.genderType}</span>
                    </div>
                    {roomTypes.length > 0 && (
                      <div className="text-sm text-muted-foreground">{roomTypes.join(', ')}</div>
                    )}
                  </div>
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {property.amenities.slice(0, 4).map((amenity, index) => {
                        const Icon = amenityIcons[amenity.name.toLowerCase()] || Wifi
                        return (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Icon className="h-3 w-3 mr-1" />
                            {amenity.name}
                          </Badge>
                        )
                      })}
                      {property.amenities.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{property.amenities.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">
                    {minRent && maxRent && minRent !== maxRent ? (
                      <>
                        ₹{minRent.toLocaleString()} - ₹{maxRent.toLocaleString()}/mo
                      </>
                    ) : minRent ? (
                      <>₹{minRent.toLocaleString()}/mo</>
                    ) : (
                      'Contact for pricing'
                    )}
                  </div>
                  <Button asChild>
                    <Link href={`/properties/${property.slug}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )
    }

    // Grid layout
    return (
      <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <img
            src={image?.url || 'https://picsum.photos/400/300'}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">{property.propertyType}</Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">
              {property.address.location.city}, {property.address.location.state}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <Users className="h-3 w-3" />
            <span>{property.genderType}</span>
          </div>
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {property.amenities.slice(0, 3).map((amenity, index) => {
                const Icon = amenityIcons[amenity.name.toLowerCase()] || Wifi
                return (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Icon className="h-3 w-3 mr-1" />
                    {amenity.name}
                  </Badge>
                )
              })}
              {property.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.amenities.length - 3}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">
              {minRent && maxRent && minRent !== maxRent ? (
                <>₹{minRent.toLocaleString()}+</>
              ) : minRent ? (
                <>₹{minRent.toLocaleString()}/mo</>
              ) : (
                'Contact for pricing'
              )}
            </div>
            <Button asChild size="sm">
              <Link href={`/properties/${property.slug}`}>View</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <section className={`${getBackgroundClass()} ${getPaddingClass()}`}>
        <div className={`mx-auto px-4 ${getMaxWidthClass()}`}>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          </div>
        </div>
      </section>
    )
  }

  if (properties.length === 0) {
    return null
  }

  return (
    <section className={`${getBackgroundClass()} ${getPaddingClass()}`}>
      <div className={`mx-auto px-4 ${getMaxWidthClass()}`}>
        <header className={`mb-8 ${getTextAlignClass()}`}>
          {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
          {subtitle && <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>}
          {description && <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>}
        </header>

        <div className={`grid gap-6 ${getGridClass()}`}>{properties.map(renderPropertyCard)}</div>

        {showViewAllButton && (
          <div className={`mt-8 ${getTextAlignClass()}`}>
            <Button asChild variant="outline">
              <Link href={viewAllButtonUrl}>{viewAllButtonText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
