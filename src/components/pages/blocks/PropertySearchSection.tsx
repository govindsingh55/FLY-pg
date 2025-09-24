'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Search,
  MapPin,
  Filter,
  Home,
  Users,
  DollarSign,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Shield,
  WashingMachine,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PropertySearchSectionProps {
  title: string
  subtitle?: string
  description?: string
  searchPlaceholder?: string
  showFilters?: boolean
  showPropertyTypes?: boolean
  showGenderTypes?: boolean
  showPriceRange?: boolean
  showAmenities?: boolean
  searchButtonText?: string
  searchResultsUrl?: string
  backgroundColor?: string
  textAlignment?: string
  padding?: string
  maxWidth?: string
  backgroundImage?: any
  overlayOpacity?: string
}

const propertyTypes = [
  { value: 'PG', label: 'PG' },
  { value: 'Hostel', label: 'Hostel' },
  { value: 'Apartment', label: 'Apartment' },
]

const genderTypes = [
  { value: 'Unisex', label: 'Unisex' },
  { value: 'Male', label: 'Male Only' },
  { value: 'Female', label: 'Female Only' },
]

const amenities = [
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'food', label: 'Food', icon: Utensils },
  { value: 'gym', label: 'Gym', icon: Dumbbell },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'laundry', label: 'Laundry', icon: WashingMachine },
]

const priceRanges = [
  { value: '0-5000', label: 'Under ₹5,000' },
  { value: '5000-10000', label: '₹5,000 - ₹10,000' },
  { value: '10000-15000', label: '₹10,000 - ₹15,000' },
  { value: '15000-20000', label: '₹15,000 - ₹20,000' },
  { value: '20000+', label: 'Above ₹20,000' },
]

export function PropertySearchSection({
  title,
  subtitle,
  description,
  searchPlaceholder = 'Search by location, property name...',
  showFilters = true,
  showPropertyTypes = true,
  showGenderTypes = true,
  showPriceRange = true,
  showAmenities = true,
  searchButtonText = 'Search Properties',
  searchResultsUrl = '/properties',
  backgroundColor = 'primary',
  textAlignment = 'center',
  padding = 'large',
  maxWidth = 'default',
  backgroundImage,
  overlayOpacity = 'medium',
}: PropertySearchSectionProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPropertyType, setSelectedPropertyType] = useState('')
  const [selectedGenderType, setSelectedGenderType] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

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
        return 'max-w-8xl'
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

  const getOverlayClass = () => {
    switch (overlayOpacity) {
      case 'light':
        return 'bg-black/20'
      case 'medium':
        return 'bg-black/40'
      case 'dark':
        return 'bg-black/60'
      case 'heavy':
        return 'bg-black/80'
      default:
        return 'bg-black/40'
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (searchQuery) params.set('search', searchQuery)
    if (selectedPropertyType) params.set('propertyType', selectedPropertyType)
    if (selectedGenderType) params.set('genderType', selectedGenderType)
    if (selectedPriceRange) params.set('priceRange', selectedPriceRange)
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','))

    const queryString = params.toString()
    const url = queryString ? `${searchResultsUrl}?${queryString}` : searchResultsUrl

    router.push(url)
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity],
    )
  }

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {}

  return (
    <section
      className={`relative ${getBackgroundClass()} ${getPaddingClass()}`}
      style={backgroundStyle}
    >
      {backgroundImage && <div className={`absolute inset-0 ${getOverlayClass()}`} />}

      <div className={`relative mx-auto px-4 ${getMaxWidthClass()}`}>
        <header className={`mb-8 ${getTextAlignClass()}`}>
          {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
          {subtitle && <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>}
          {description && <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>}
        </header>

        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                {showPropertyTypes && (
                  <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {showGenderTypes && (
                  <Select value={selectedGenderType} onValueChange={setSelectedGenderType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {showPriceRange && (
                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {showFilters && showAmenities && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Amenities
                        {selectedAmenities.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {selectedAmenities.length}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Select Amenities</SheetTitle>
                        <SheetDescription>
                          Choose the amenities you&apos;re looking for in your property.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-3">
                        {amenities.map((amenity) => {
                          const Icon = amenity.icon
                          const isSelected = selectedAmenities.includes(amenity.value)
                          return (
                            <button
                              key={amenity.value}
                              onClick={() => toggleAmenity(amenity.value)}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border hover:bg-muted'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                              <span>{amenity.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>

              {/* Selected Amenities */}
              {selectedAmenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedAmenities.map((amenity) => {
                    const amenityData = amenities.find((a) => a.value === amenity)
                    return (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                        {amenityData?.label}
                        <button
                          onClick={() => toggleAmenity(amenity)}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}

              {/* Search Button */}
              <div className="flex justify-center pt-4">
                <Button onClick={handleSearch} size="lg" className="px-8">
                  <Search className="h-4 w-4 mr-2" />
                  {searchButtonText}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
