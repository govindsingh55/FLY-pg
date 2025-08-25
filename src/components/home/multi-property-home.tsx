import AmenityGrid from '@/components/marketing/AmenityGrid'
import FeatureBand from '@/components/marketing/FeatureBand'
import Gallery from '@/components/marketing/Gallery'
import HeroSearch from '@/components/marketing/HeroSearch'
import PressLogos from '@/components/marketing/PressLogos'
import PropertyCarousel from '@/components/marketing/PropertyCarousel'
import TestimonialWall from '@/components/marketing/TestimonialWall'
import { Search, MessageCircle } from 'lucide-react'

// Import new reusable components
import ContactCTASection from '@/components/marketing/ContactCTASection'
import StatsSection from '@/components/marketing/StatsSection'
import { stats } from '@/data'

export default function MultiPropertyHome() {
  // Prepare contact CTA actions for multi-property context
  const contactActions = [
    {
      label: 'Explore Properties',
      icon: Search,
      variant: 'default' as const,
    },
    {
      label: 'Contact Us',
      icon: MessageCircle,
      variant: 'outline' as const,
    },
  ]

  return (
    <>
      <HeroSearch />
      <AmenityGrid />
      <FeatureBand />
      <StatsSection stats={stats} variant="default" />
      <PropertyCarousel />
      <PressLogos />
      <Gallery />
      <TestimonialWall />
      <ContactCTASection
        title="Ready to Find Your Perfect Home?"
        description="Join our community and experience the future of co-living. Explore our properties and get in touch with our team today."
        actions={contactActions}
        variant="primary"
      />
    </>
  )
}
