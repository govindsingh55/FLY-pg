// Modern landing page optimized for showcasing a SINGLE property.
// This is designed for when the platform starts with only one property,
// creating a dedicated experience that highlights all property features.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import BookingCard from '@/components/marketing/property-detail/BookingCard'
import { PropertyDetailProvider } from '@/lib/state/propertyDetail'
import TestimonialWall from '@/components/marketing/TestimonialWall'
import PressLogos from '@/components/marketing/PressLogos'
import AppPromo from '@/components/marketing/AppPromo'
import { features, stats } from '@/data'
import type { Media as MediaType } from '@/payload/payload-types'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Calendar, MessageCircle, Phone } from 'lucide-react'

// Import new reusable components
import HeroSection from '@/components/marketing/HeroSection'
import FeaturesSection from '@/components/marketing/FeaturesSection'
import PropertyDetailsSection from '@/components/marketing/PropertyDetailsSection'
import ContactCTASection from '@/components/marketing/ContactCTASection'
import StatsSection from '@/components/marketing/StatsSection'

// Avoid static generation – ensures we always query the latest single property.
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

async function fetchFirstProperty() {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'properties',
      depth: 2,
      limit: 1,
    })
    const doc: any = res.docs[0]
    if (!doc) return null

    const images = Array.isArray(doc.images) ? doc.images : []
    const rooms = Array.isArray(doc.rooms)
      ? doc.rooms
          .map((r: any) => ({
            id: r.id,
            name: r.name,
            roomType: r.roomType,
            rent: r.rent,
            available: r.available,
          }))
          .filter(Boolean)
      : []
    const nearby = (doc.nearbyLocations || []).map((l: any) => ({
      name: l?.name ?? '',
      distance: l?.distance ?? '',
    }))

    return { ...doc, images, rooms, nearby }
  } catch (e) {
    console.error('[single property home] fetchFirstProperty failed:', (e as any)?.message)
    return null
  }
}

export default async function SinglePropertyHome() {
  const prop = await fetchFirstProperty()

  if (!prop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="mx-auto max-w-lg text-center">
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
  ] as any

  const images = (prop.images?.length ? prop.images : fallbackImages) as {
    image: MediaType
    id: string
    isCover: boolean
  }[]

  const minRent = prop.rooms?.length ? Math.min(...prop.rooms.map((r: any) => r.rent)) : null
  const availableRooms = prop.rooms?.filter((r: any) => r.available !== false).length || 0

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
    },
    {
      label: 'WhatsApp Us',
      icon: MessageCircle,
      variant: 'outline' as const,
    },
    {
      label: 'Call Now',
      icon: Phone,
      variant: 'outline' as const,
    },
  ]

  return (
    <PropertyDetailProvider>
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
        }}
        secondaryCta={{
          label: 'Call Now',
          icon: Phone,
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
      <PropertyDetailsSection
        property={prop}
        bookingCard={<BookingCard rooms={prop.rooms} propertyId={String(prop.id || '')} />}
      />

      {/* Social Proof */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <TestimonialWall />
        </div>
      </section>

      {/* Press & Recognition */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <PressLogos />
        </div>
      </section>

      {/* App Promotion */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="mx-auto max-w-6xl px-6">
          <AppPromo />
        </div>
      </section>

      {/* Contact CTA */}
      <ContactCTASection
        title={`Ready to Make ${prop.name} Your Home?`}
        description="Join our community and experience the future of co-living. Book a visit or get in touch with our team today."
        actions={contactActions}
        variant="primary"
      />
    </PropertyDetailProvider>
  )
}
