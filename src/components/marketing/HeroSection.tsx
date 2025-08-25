import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface CTAButton {
  label: string
  icon?: LucideIcon
  onClick?: () => void
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
}

interface HeroSectionProps {
  title: string
  subtitle?: string
  badges?: Array<{ text: string; variant?: 'default' | 'secondary' | 'outline' }>
  priceInfo?: {
    label: string
    amount: string
    period?: string
  }
  locationInfo?: {
    label: string
    text: string
  }
  primaryCta?: CTAButton
  secondaryCta?: CTAButton
  backgroundImage?: string
  showScrollIndicator?: boolean
  className?: string
  children?: ReactNode
}

export default function HeroSection({
  title,
  subtitle,
  badges = [],
  priceInfo,
  locationInfo,
  primaryCta,
  secondaryCta,
  backgroundImage,
  showScrollIndicator = true,
  className = '',
  children,
}: HeroSectionProps) {
  return (
    <section
      className={`relative min-h-[70vh] flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Background */}
      {backgroundImage ? (
        <div className="absolute inset-0">
          <img src={backgroundImage} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 text-center">
        <div className="mx-auto max-w-4xl">
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || 'secondary'}
                  className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl font-extrabold text-white md:text-6xl lg:text-7xl mb-6 leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Price and Location Info */}
          {(priceInfo || locationInfo) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              {priceInfo && (
                <div className="text-white text-center">
                  <div className="text-sm opacity-80">{priceInfo.label}</div>
                  <div className="text-2xl font-bold">
                    {priceInfo.amount}
                    {priceInfo.period && (
                      <span className="text-base font-normal">{priceInfo.period}</span>
                    )}
                  </div>
                </div>
              )}

              {priceInfo && locationInfo && (
                <div className="hidden sm:block w-px h-12 bg-white/30"></div>
              )}

              {locationInfo && (
                <div className="text-white text-center">
                  <div className="text-sm opacity-80">{locationInfo.label}</div>
                  <div className="text-lg font-semibold">{locationInfo.text}</div>
                </div>
              )}
            </div>
          )}

          {/* Call to Action Buttons */}
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryCta && (
                <Button
                  size="lg"
                  variant={primaryCta.variant || 'default'}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg backdrop-blur-sm"
                  onClick={primaryCta.onClick}
                >
                  {primaryCta.icon && <primaryCta.icon className="mr-2 h-5 w-5" />}
                  {primaryCta.label}
                </Button>
              )}

              {secondaryCta && (
                <Button
                  size="lg"
                  variant={secondaryCta.variant || 'outline'}
                  className="border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm"
                  onClick={secondaryCta.onClick}
                >
                  {secondaryCta.icon && <secondaryCta.icon className="mr-2 h-5 w-5" />}
                  {secondaryCta.label}
                </Button>
              )}
            </div>
          )}

          {/* Custom content */}
          {children}
        </div>
      </div>

      {/* Scroll indicator */}
      {showScrollIndicator && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/60" />
        </div>
      )}
    </section>
  )
}
