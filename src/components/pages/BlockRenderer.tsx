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

interface Block {
  blockType: string
  [key: string]: any
}

interface BlockRendererProps {
  block: Block
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.blockType) {
    case 'hero':
      return <HeroSection {...block} />

    case 'features':
      return <FeaturesSection {...block} />

    case 'contact':
      return <ContactSection {...block} />

    case 'stats':
      return <StatsSection {...block} />

    case 'content':
      return <ContentSection {...block} />

    case 'media':
      return <MediaSection {...block} />

    case 'testimonials':
      return <TestimonialsSection {...block} />

    case 'gallery':
      return <GallerySection {...block} />

    case 'press':
      return <PressSection {...block} />

    case 'amenities':
      return <AmenitiesSection {...block} />

    case 'locations':
      return <AmenitiesSection {...block} /> // Reuse amenities component for locations

    case 'pricing':
      return <PricingSection {...block} />

    case 'faq':
      return <FAQSection {...block} />

    case 'text':
      return <TextSection {...block} />

    case 'image':
      return <ImageSection {...block} />

    case 'spacer':
      return <SpacerSection {...block} />

    case 'divider':
      return <DividerSection {...block} />

    case 'cta':
      return <ContactSection {...block} /> // Reuse contact component for CTA

    default:
      console.warn(`Unknown block type: ${block.blockType}`)
      return null
  }
}
