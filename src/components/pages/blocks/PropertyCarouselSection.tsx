'use client'

import React, { useState, useEffect } from 'react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import type { Media } from '@/payload/payload-types'

interface PropertyCarouselSectionProps {
  title: string
  subtitle?: string
  description?: string
  showAllProperties?: boolean
  selectedProperties?: string[]
  maxProperties?: number
  _showFilters?: boolean
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
  }>
  amenities?: Array<{
    name: string
    icon?: Media
  }>
}

export function PropertyCarouselSection({
  title,
  subtitle,
  description,
  showAllProperties = true,
  selectedProperties = [],
  maxProperties = 10,
  _showFilters = false,
  showViewAllButton = true,
  viewAllButtonText = 'View All Properties',
  viewAllButtonUrl = '/properties',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
}: PropertyCarouselSectionProps) {
  const [properties, setProperties] = useState<ProcessedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [api, setApi] = useState<CarouselApi | null>(null)
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

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

  useEffect(() => {
    if (!api) return
    const init = () => {
      const snaps = api.scrollSnapList()
      setCount(snaps.length)
      const idx = api.selectedScrollSnap()
      setCurrent(idx)
      setCanPrev(idx > 0)
      setCanNext(idx < snaps.length - 1)
    }
    const onSelect = () => {
      const idx = api.selectedScrollSnap()
      setCurrent(idx)
      setCanPrev(idx > 0)
      setCanNext(idx < api.scrollSnapList().length - 1)
    }
    api.on('select', onSelect)
    api.on('reInit', init)
    init()
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

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

  const getPropertyImage = (property: ProcessedProperty) => {
    const coverImage = property.images?.find((img) => img.isCover)?.image
    const firstImage = property.images?.[0]?.image
    return coverImage || firstImage
  }

  const getMinRent = (property: ProcessedProperty) => {
    if (!property.rooms || property.rooms.length === 0) return null
    return Math.min(...property.rooms.map((room) => room.rent))
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

        <Carousel opts={{ align: 'start', loop: false }} className="w-full" setApi={setApi}>
          <CarouselContent className={count <= 1 ? 'justify-center' : undefined}>
            {properties.map((property) => {
              const image = getPropertyImage(property)
              const minRent = getMinRent(property)

              return (
                <CarouselItem
                  key={property.id}
                  className="basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <Link
                    href={`/properties/${property.slug}`}
                    className="group block h-full rounded-xl border bg-card shadow-sm hover:shadow-lg transition-all duration-300 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
                      <img
                        src={image?.url || 'https://picsum.photos/400/300'}
                        alt={property.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                        draggable={false}
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {property.propertyType}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">
                          {property.address.location.city}, {property.address.location.state}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{property.genderType}</span>
                        </div>
                        {minRent && (
                          <div className="text-sm font-semibold">
                            ₹{minRent.toLocaleString()}/mo
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              )
            })}
          </CarouselContent>

          {/* Controls & Indicators */}
          {count > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => api?.scrollTo(Math.max(current - 1, 0))}
                  disabled={!canPrev}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => api?.scrollTo(Math.min(current + 1, count - 1))}
                  disabled={!canNext}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-1" aria-label="Carousel progress" role="tablist">
                {Array.from({ length: count }).map((_, i) => {
                  const activeDot = i === current
                  return (
                    <button
                      key={i}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-selected={activeDot}
                      role="tab"
                      onClick={() => api?.scrollTo(i)}
                      className={`h-1.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-primary ${
                        activeDot ? 'w-5 bg-primary' : 'w-2 bg-muted hover:bg-muted/70'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </Carousel>

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
