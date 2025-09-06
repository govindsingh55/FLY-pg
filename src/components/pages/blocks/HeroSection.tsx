import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  Search,
  ArrowRight,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Icon mapping
const iconMap = {
  Calendar,
  Phone,
  Mail,
  MapPin,
  Search,
  ArrowRight,
  ExternalLink,
} as const

interface HeroSectionProps {
  title: string
  subtitle?: string
  badges?: Array<{
    text: string
    variant?: 'default' | 'secondary' | 'outline'
  }>
  priceInfo?: {
    label: string
    amount: string
    period?: string
  }
  locationInfo?: {
    label: string
    text: string
  }
  primaryCta?: {
    label: string
    icon?: keyof typeof iconMap
    url?: string
  }
  secondaryCta?: {
    label: string
    icon?: keyof typeof iconMap
    url?: string
  }
  backgroundImage?: string
  showScrollIndicator?: boolean
  variant?: 'default' | 'minimal' | 'overlay'
  // Enhanced styling options
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  overlayOpacity?: 'light' | 'medium' | 'dark'
}

export function HeroSection({
  title,
  subtitle,
  badges = [],
  priceInfo,
  locationInfo,
  primaryCta,
  secondaryCta,
  backgroundImage,
  showScrollIndicator = true,
  variant = 'default',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
  overlayOpacity = 'medium',
}: HeroSectionProps) {
  const renderCtaButton = (cta: typeof primaryCta, isPrimary = true) => {
    if (!cta) return null

    const IconComponent = cta.icon ? iconMap[cta.icon] : null
    const buttonContent = (
      <>
        {IconComponent && <IconComponent className="mr-2 h-5 w-5" />}
        {cta.label}
      </>
    )

    if (cta.url) {
      return (
        <Button
          asChild
          size="lg"
          variant={isPrimary ? 'default' : 'outline'}
          className={isPrimary ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
        >
          <Link href={cta.url}>{buttonContent}</Link>
        </Button>
      )
    }

    return (
      <Button
        size="lg"
        variant={isPrimary ? 'default' : 'outline'}
        className={isPrimary ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
      >
        {buttonContent}
      </Button>
    )
  }

  // Style configurations
  const variantStyles = {
    default: 'min-h-screen flex items-center justify-center relative',
    minimal: 'py-20 flex items-center justify-center relative',
    overlay: 'min-h-screen flex items-center justify-center relative',
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
    default: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-none',
  }

  const overlayStyles = {
    light: 'bg-black/20',
    medium: 'bg-black/40',
    dark: 'bg-black/60',
  }

  return (
    <section className={`${variantStyles[variant]} ${backgroundStyles[backgroundColor]}`}>
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image src={backgroundImage} alt="" fill className="object-cover" priority />
          <div className={`absolute inset-0 ${overlayStyles[overlayOpacity]}`} />
        </div>
      )}

      {/* Content */}
      <div
        className={`relative z-10 mx-auto ${maxWidthStyles[maxWidth]} px-6 ${textAlignStyles[textAlignment]}`}
      >
        {/* Badges */}
        {badges.length > 0 && (
          <div
            className={`mb-6 flex flex-wrap gap-2 ${
              textAlignment === 'center'
                ? 'justify-center'
                : textAlignment === 'right'
                  ? 'justify-end'
                  : 'justify-start'
            }`}
          >
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant || 'default'} className="px-4 py-2">
                {badge.text}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && <p className="mb-8 text-xl text-white/90 sm:text-2xl">{subtitle}</p>}

        {/* Price and Location Info */}
        {(priceInfo || locationInfo) && (
          <div
            className={`mb-8 flex flex-col gap-4 sm:flex-row ${
              textAlignment === 'center'
                ? 'items-center sm:justify-center'
                : textAlignment === 'right'
                  ? 'items-end sm:justify-end'
                  : 'items-start sm:justify-start'
            }`}
          >
            {priceInfo && (
              <div className={textAlignStyles[textAlignment]}>
                <p className="text-sm text-white/80">{priceInfo.label}</p>
                <p className="text-2xl font-bold text-white">
                  {priceInfo.amount}
                  {priceInfo.period && (
                    <span className="text-lg text-white/80">{priceInfo.period}</span>
                  )}
                </p>
              </div>
            )}
            {locationInfo && (
              <div className={textAlignStyles[textAlignment]}>
                <p className="text-sm text-white/80">{locationInfo.label}</p>
                <p className="text-lg font-medium text-white">{locationInfo.text}</p>
              </div>
            )}
          </div>
        )}

        {/* Call to Action Buttons */}
        {(primaryCta || secondaryCta) && (
          <div
            className={`flex flex-col gap-4 sm:flex-row ${
              textAlignment === 'center'
                ? 'sm:justify-center'
                : textAlignment === 'right'
                  ? 'sm:justify-end'
                  : 'sm:justify-start'
            }`}
          >
            {renderCtaButton(primaryCta, true)}
            {renderCtaButton(secondaryCta, false)}
          </div>
        )}

        {/* Scroll Indicator */}
        {showScrollIndicator && variant === 'default' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-white/80" />
          </div>
        )}
      </div>
    </section>
  )
}
