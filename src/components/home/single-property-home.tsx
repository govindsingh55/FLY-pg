// Modern landing page optimized for showcasing a SINGLE property.
// This is designed for when the platform starts with only one property,
// creating a dedicated experience that highlights all property features.

import PressLogos from '@/components/marketing/PressLogos'
import TestimonialWall from '@/components/marketing/TestimonialWall'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { features, stats } from '@/data'
import type { Media as MediaType, Property, Room } from '@/payload/payload-types'
import config from '@payload-config'
import { Calendar, MessageCircle, Phone } from 'lucide-react'
import { getPayload } from 'payload'

// Import new reusable components
import ContactCTASection from '@/components/marketing/ContactCTASection'
import FeaturesSection from '@/components/marketing/FeaturesSection'
import HeroSection from '@/components/marketing/HeroSection'
import PropertyDetailsSection from '@/components/marketing/PropertyDetailsSection'
import StatsSection from '@/components/marketing/StatsSection'

// Type definitions for processed data that extends Payload types
interface ProcessedRoom {
  id: string
  name: string
  roomType: Room['roomType']
  rent: number
  available: boolean
}

interface ProcessedNearbyLocation {
  name: string
  distance: string
}

interface ProcessedImage {
  id: string
  isCover: boolean
  image: MediaType
}

interface ProcessedProperty extends Omit<Property, 'rooms' | 'nearbyLocations' | 'images'> {
  images: ProcessedImage[]
  rooms: ProcessedRoom[]
  nearby: ProcessedNearbyLocation[]
  tagline?: string
}

interface FallbackImage {
  id: string
  isCover: boolean
  image: {
    id: string
    url: string
    filename: string
    mimeType: string
    filesize: number
    width: number
    height: number
  }
}

// Avoid static generation – ensures we always query the latest single property.
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

async function fetchFirstProperty(): Promise<ProcessedProperty | null> {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'properties',
      depth: 2,
      limit: 1,
      where: {
        _status: { equals: 'published' },
      },
      draft: false,
    })

    const doc = res.docs[0] as Property
    if (!doc) return null

    const images = Array.isArray(doc.images)
      ? doc.images
          .map((img) => ({
            id: img.id || '',
            isCover: img.isCover || false,
            image: img.image as MediaType,
          }))
          .filter((img) => img.id && img.image)
      : []
    const rooms = Array.isArray(doc.rooms)
      ? doc.rooms
          .map((r: Room | string) => {
            if (typeof r === 'string') return null
            return {
              id: r.id,
              name: r.name,
              roomType: r.roomType,
              rent: r.rent,
              available: r.available ?? true,
            }
          })
          .filter((r): r is ProcessedRoom => r !== null)
      : []
    const nearby = (doc.nearbyLocations || []).map((l) => ({
      name: l?.name ?? '',
      distance: l?.distance ?? '',
    }))

    return { ...doc, images, rooms, nearby }
  } catch (e) {
    console.error('[single property home] fetchFirstProperty failed:', (e as Error)?.message)
    return null
  }
}

export default async function SinglePropertyHome() {
  const prop = await fetchFirstProperty()

  if (!prop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="mx-auto max-w-lg w-full text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to FLY</CardTitle>
            <CardDescription>
              Our premium co-living space is coming online soon. Check back shortly for an amazing
              living experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Get Notified</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sector =
    typeof prop.address?.location?.sector === 'string' ? prop.address.location.sector : undefined
  const city =
    typeof prop.address?.location?.city === 'string' ? prop.address.location.city : undefined
  const localityLine = [sector, city].filter(Boolean).join(', ')

  // Enhanced fallback with better placeholder content using Picsum
  const fallbackImages = [
    {
      id: 'hero-1',
      isCover: true,
      image: {
        id: 'hero-1',
        url: 'https://picsum.photos/seed/property-hero/1200/800',
        filename: 'hero-1.jpg',
        mimeType: 'image/jpeg',
        filesize: 0,
        width: 1200,
        height: 800,
      },
    },
    {
      id: 'gallery-1',
      isCover: false,
      image: {
        id: 'gallery-1',
        url: 'https://picsum.photos/seed/property-gallery-1/800/600',
        filename: 'gallery-1.jpg',
        mimeType: 'image/jpeg',
        filesize: 0,
        width: 800,
        height: 600,
      },
    },
    {
      id: 'gallery-2',
      isCover: false,
      image: {
        id: 'gallery-2',
        url: 'https://picsum.photos/seed/property-gallery-2/800/600',
        filename: 'gallery-2.jpg',
        mimeType: 'image/jpeg',
        filesize: 0,
        width: 800,
        height: 600,
      },
    },
  ] as FallbackImage[]

  const images = (prop.images?.length ? prop.images : fallbackImages) as ProcessedImage[]

  const minRent = prop.rooms?.length
    ? Math.min(...prop.rooms.map((r: ProcessedRoom) => r.rent))
    : null
  const availableRooms = prop.rooms?.filter((r: ProcessedRoom) => r.available !== false).length || 0

  // Prepare hero section data
  const heroBadges = []
  if (prop.genderType) heroBadges.push({ text: prop.genderType, variant: 'secondary' as const })
  if (prop.propertyType) heroBadges.push({ text: prop.propertyType, variant: 'secondary' as const })
  if (availableRooms > 0)
    heroBadges.push({ text: `${availableRooms} Rooms Available`, variant: 'default' as const })

  // Prepare features data
  const propertyFeatures = features.slice(0, 3).map((feature, index) => ({
    id: feature.id,
    title: feature.title,
    subtitle: feature.subtitle,
    description: feature.description,
    icon: index === 0 ? 'Search' : index === 1 ? 'Home' : 'Users',
    accent: 'primary' as const,
  }))

  // Prepare contact CTA actions
  const contactActions = [
    {
      label: 'Schedule a Visit',
      icon: Calendar,
      variant: 'default' as const,
      href: `/properties/${prop.slug || prop.id}`,
    },
    {
      label: 'WhatsApp Us',
      icon: MessageCircle,
      variant: 'outline' as const,
      href: `https://wa.me/7678688964`,
    },
    {
      label: 'Call Now',
      icon: Phone,
      variant: 'outline' as const,
      href: `tel:7678688964`,
    },
  ]

  // Create a compatible property object for PropertyDetailsSection
  const compatibleProperty = {
    id: prop.id,
    name: prop.name,
    description: prop.description,
    amenities: prop.amenities?.map((item) => (typeof item === 'string' ? item : item)) || [],
    foodMenu: prop.foodMenu
      ? {
          menu: prop.foodMenu.menu ? { description: prop.foodMenu.menu } : undefined,
          price: prop.foodMenu.price || undefined,
        }
      : undefined,
    nearby: prop.nearby,
    rooms: prop.rooms,
    images: prop.images,
    address: prop.address
      ? {
          address: prop.address.address,
          location: {
            sector: prop.address.location?.sector || undefined,
            city: prop.address.location?.city || undefined,
          },
        }
      : undefined,
  }

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title={prop.name}
        subtitle={
          prop.tagline ||
          'Experience premium co-living with modern amenities, vibrant community, and seamless living.'
        }
        badges={heroBadges}
        priceInfo={
          minRent
            ? {
                label: 'Starting from',
                amount: `₹${minRent.toLocaleString()}`,
                period: '/month',
              }
            : undefined
        }
        locationInfo={
          localityLine
            ? {
                label: 'Location',
                text: localityLine,
              }
            : undefined
        }
        primaryCta={{
          label: 'Schedule Visit',
          icon: Calendar,
          href: `/properties/${prop.slug || prop.id}`,
        }}
        secondaryCta={{
          label: 'Call Now',
          icon: Phone,
          href: `tel:7678688964`,
        }}
        backgroundImage={images[0]?.image?.url || undefined}
      />

      {/* Quick Stats */}
      <StatsSection stats={stats} variant="floating" />

      {/* Features Overview */}
      <FeaturesSection
        title={`Why Choose ${prop.name}?`}
        subtitle="Experience the perfect blend of comfort, community, and convenience in our thoughtfully designed spaces."
        features={propertyFeatures}
        columns={3}
      />

      {/* Main Property Details */}
      <PropertyDetailsSection property={compatibleProperty} />

      {/* Social Proof */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-8xl px-6">
          <TestimonialWall />
        </div>
      </section>

      {/* Press & Recognition */}
      <section className="py-12">
        <div className="mx-auto max-w-8xl px-6">
          <PressLogos />
        </div>
      </section>

      {/* Contact CTA */}
      <ContactCTASection
        title={`Ready to Make ${prop.name} Your Home?`}
        description="Join our community and experience the future of co-living. Book a visit or get in touch with our team today."
        actions={contactActions}
        variant="primary"
      />
    </>
  )
}
