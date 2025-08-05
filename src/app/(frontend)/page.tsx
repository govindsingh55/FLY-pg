import AmenityGrid from '@/components/marketing/AmenityGrid'
import FeatureBand from '@/components/marketing/FeatureBand'
import Gallery from '@/components/marketing/Gallery'
import HeroSearch from '@/components/marketing/HeroSearch'
import PressLogos from '@/components/marketing/PressLogos'
import PropertyCarousel from '@/components/marketing/PropertyCarousel'
import StatStrip from '@/components/marketing/StatStrip'
import TestimonialWall from '@/components/marketing/TestimonialWall'

export default function HomePage() {
  return (
    <>
      <HeroSearch />
      <AmenityGrid />
      <FeatureBand />
      <StatStrip />
      <PropertyCarousel />
      <PressLogos />
      <Gallery />
      <TestimonialWall />
    </>
  )
}
