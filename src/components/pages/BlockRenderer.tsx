import React from 'react'
import { HeroSection } from './blocks/HeroSection'
import { FeaturesSection } from './blocks/FeaturesSection'
import { ContactSection } from './blocks/ContactSection'
import { StatsSection } from './blocks/StatsSection'
import { ContentSection } from './blocks/ContentSection'
import { MediaSection } from './blocks/MediaSection'
import { TestimonialsSection } from './blocks/TestimonialsSection'
import { GallerySection } from './blocks/GallerySection'
import { PressSection } from './blocks/PressSection'
import { AmenitiesSection } from './blocks/AmenitiesSection'
import { PricingSection } from './blocks/PricingSection'
import { FAQSection } from './blocks/FAQSection'
import { TextSection } from './blocks/TextSection'
import { ImageSection } from './blocks/ImageSection'
import { SpacerSection } from './blocks/SpacerSection'
import { DividerSection } from './blocks/DividerSection'
import { PropertyCarouselSection } from './blocks/PropertyCarouselSection'
import { PropertySearchSection } from './blocks/PropertySearchSection'
import { PropertyListingSection } from './blocks/PropertyListingSection'

interface Block {
  blockType: string
  [key: string]: unknown
}

interface BlockRendererProps {
  block: Block
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.blockType) {
    case 'hero':
      return <HeroSection {...(block as any)} />

    case 'features':
      return <FeaturesSection {...(block as any)} />

    case 'contact':
      return <ContactSection {...(block as any)} />

    case 'stats':
      return <StatsSection {...(block as any)} />

    case 'content':
      return <ContentSection {...(block as any)} />

    case 'media':
      return <MediaSection {...(block as any)} />

    case 'testimonials':
      return <TestimonialsSection {...(block as any)} />

    case 'gallery':
      return <GallerySection {...(block as any)} />

    case 'press':
      return <PressSection {...(block as any)} />

    case 'amenities':
      return <AmenitiesSection {...(block as any)} />

    case 'locations':
      return <AmenitiesSection {...(block as any)} /> // Reuse amenities component for locations

    case 'pricing':
      return <PricingSection {...(block as any)} />

    case 'faq':
      return <FAQSection {...(block as any)} />

    case 'text':
      return <TextSection {...(block as any)} />

    case 'image':
      return <ImageSection {...(block as any)} />

    case 'spacer':
      return <SpacerSection {...(block as any)} />

    case 'divider':
      return <DividerSection {...(block as any)} />

    case 'cta':
      return <ContactSection {...(block as any)} /> // Reuse contact component for CTA

    case 'property-carousel':
      return <PropertyCarouselSection {...(block as any)} />

    case 'property-search':
      return <PropertySearchSection {...(block as any)} />

    case 'property-listing':
      return <PropertyListingSection {...(block as any)} />

    default:
      console.warn(`Unknown block type: ${block.blockType}`)
      return null
  }
}
