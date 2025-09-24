import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Wifi,
  Shield,
  Car,
  Utensils,
  Dumbbell,
  Camera,
  Heart,
  Star,
  CheckCircle,
  Home,
  Users,
  Lock,
  Sun,
  Moon,
  MapPin,
} from 'lucide-react'
import Image from 'next/image'

// Icon mapping
const iconMap = {
  Wifi,
  Shield,
  Car,
  Utensils,
  Dumbbell,
  Camera,
  Heart,
  Star,
  CheckCircle,
  Home,
  Users,
  Lock,
  Sun,
  Moon,
  MapPin,
} as const

interface Feature {
  title: string
  description?: string
  icon?: keyof typeof iconMap
  image?: string
}

interface FeaturesSectionProps {
  title: string
  subtitle?: string
  features: Feature[]
  columns?: '2' | '3' | '4'
  variant?: 'default' | 'cards' | 'minimal' | 'accent'
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  // Enhanced styling options
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  showBorder?: boolean
}

export function FeaturesSection({
  title,
  subtitle,
  features,
  columns = '3',
  variant = 'default',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
  showBorder = false,
}: FeaturesSectionProps) {
  const columnClasses = {
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
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
    default: 'max-w-6xl',
    wide: 'max-w-8xl',
    full: 'max-w-none',
  }

  const variantStyles = {
    default: 'space-y-4',
    cards: 'space-y-4',
    minimal: 'space-y-6',
    accent: 'space-y-4',
  }

  const borderStyles = showBorder ? 'border border-border rounded-lg' : ''

  const renderFeature = (feature: Feature, index: number) => {
    const IconComponent = feature.icon ? iconMap[feature.icon] : null

    if (variant === 'cards') {
      return (
        <Card key={index} className="h-full transition-transform hover:scale-105">
          <CardContent className="p-6 text-center">
            {feature.image ? (
              <div className="mb-4 h-16 w-16 mx-auto relative">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ) : IconComponent ? (
              <div className="mb-4 flex justify-center">
                <IconComponent className="h-12 w-12 text-primary" />
              </div>
            ) : null}
            <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
            {feature.description && <p className="text-muted-foreground">{feature.description}</p>}
          </CardContent>
        </Card>
      )
    }

    if (variant === 'minimal') {
      return (
        <div key={index} className="text-center">
          {IconComponent && (
            <div className="mb-3 flex justify-center">
              <IconComponent className="h-8 w-8 text-primary" />
            </div>
          )}
          <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
          {feature.description && (
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          )}
        </div>
      )
    }

    // Default and accent variants
    return (
      <div key={index} className="flex items-start space-x-4">
        {IconComponent && (
          <div className="flex-shrink-0">
            <IconComponent
              className={`h-6 w-6 ${variant === 'accent' ? 'text-accent' : 'text-primary'}`}
            />
          </div>
        )}
        <div>
          <h3 className="mb-1 text-lg font-medium">{feature.title}</h3>
          {feature.description && <p className="text-muted-foreground">{feature.description}</p>}
        </div>
      </div>
    )
  }

  return (
    <section className={`${paddingStyles[padding]} ${backgroundStyles[backgroundColor]}`}>
      <div className={`mx-auto ${maxWidthStyles[maxWidth]} px-6`}>
        {showBorder ? (
          <div className={`p-8 ${borderStyles}`}>
            {/* Header */}
            <div className={`mb-12 ${textAlignStyles[textAlignment]}`}>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
              {subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
              )}
            </div>

            {/* Features Grid */}
            <div className={`grid ${columnClasses[columns]} gap-8 ${variantStyles[variant]}`}>
              {features.map(renderFeature)}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`mb-12 ${textAlignStyles[textAlignment]}`}>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
              {subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
              )}
            </div>

            {/* Features Grid */}
            <div className={`grid ${columnClasses[columns]} gap-8 ${variantStyles[variant]}`}>
              {features.map(renderFeature)}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
