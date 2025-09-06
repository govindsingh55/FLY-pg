import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

// Icon mapping
const iconMap = {
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  ExternalLink,
} as const

interface ContactAction {
  label: string
  icon?: keyof typeof iconMap
  url?: string
  variant?: 'default' | 'secondary' | 'outline'
}

interface ContactSectionProps {
  title: string
  description?: string
  actions: ContactAction[]
  variant?: 'primary' | 'secondary' | 'gradient' | 'minimal'
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary' | 'accent'
  contactInfo?: {
    phone?: string
    email?: string
    address?: string
    whatsapp?: string
  }
  // Enhanced styling options
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  showBorder?: boolean
}

export function ContactSection({
  title,
  description,
  actions,
  variant = 'primary',
  backgroundColor = 'transparent',
  contactInfo,
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
  showBorder = false,
}: ContactSectionProps) {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    gradient: 'bg-gradient-to-r from-primary via-accent to-secondary text-white',
    minimal: 'bg-muted/50',
  }

  const backgroundStyles = {
    transparent: 'bg-transparent',
    background: 'bg-background',
    muted: 'bg-muted',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
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

  const borderStyles = showBorder ? 'border border-border rounded-lg' : ''

  const buttonVariants = {
    primary: {
      default: 'bg-white text-primary hover:bg-white/90',
      secondary: 'bg-white/20 text-white hover:bg-white/30',
      outline: 'border-white text-white hover:bg-white hover:text-primary',
    },
    secondary: {
      default: 'bg-white text-secondary hover:bg-white/90',
      secondary: 'bg-white/20 text-white hover:bg-white/30',
      outline: 'border-white text-white hover:bg-white hover:text-secondary',
    },
    gradient: {
      default: 'bg-white text-primary hover:bg-white/90',
      secondary: 'bg-white/20 text-white hover:bg-white/30',
      outline: 'border-white text-white hover:bg-white hover:text-primary',
    },
    minimal: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      outline: 'border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    },
  }

  const renderAction = (action: ContactAction, index: number) => {
    const IconComponent = action.icon ? iconMap[action.icon] : null
    const buttonVariant = action.variant || 'default'
    const buttonStyle = buttonVariants[variant][buttonVariant]

    const buttonContent = (
      <>
        {IconComponent && <IconComponent className="mr-2 h-5 w-5" />}
        {action.label}
      </>
    )

    if (action.url) {
      // Handle different URL types
      let href = action.url
      if (action.url.startsWith('tel:')) {
        href = action.url
      } else if (action.url.startsWith('mailto:')) {
        href = action.url
      } else if (action.url.startsWith('http')) {
        href = action.url
      } else {
        href = action.url
      }

      return (
        <Button
          key={index}
          asChild
          size="lg"
          variant={buttonVariant === 'outline' ? 'outline' : 'default'}
          className={buttonStyle}
        >
          <Link href={href}>{buttonContent}</Link>
        </Button>
      )
    }

    return (
      <Button
        key={index}
        size="lg"
        variant={buttonVariant === 'outline' ? 'outline' : 'default'}
        className={buttonStyle}
      >
        {buttonContent}
      </Button>
    )
  }

  return (
    <section
      className={`${paddingStyles[padding]} ${backgroundColor !== 'transparent' ? backgroundStyles[backgroundColor] : ''}`}
    >
      <div className={`mx-auto ${maxWidthStyles[maxWidth]} px-6`}>
        {showBorder ? (
          <div className={`${borderStyles} p-8`}>
            <div
              className={`${textAlignStyles[textAlignment]} ${variant !== 'minimal' ? variantStyles[variant] : ''} rounded-lg p-8`}
            >
              <h2 className="mb-4 text-3xl font-bold">{title}</h2>
              {description && (
                <p className="mb-8 text-lg opacity-90 max-w-2xl mx-auto">{description}</p>
              )}

              {/* Contact Info */}
              {contactInfo && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {contactInfo.phone && (
                    <div className="flex items-center justify-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{contactInfo.phone}</span>
                    </div>
                  )}
                  {contactInfo.email && (
                    <div className="flex items-center justify-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{contactInfo.email}</span>
                    </div>
                  )}
                  {contactInfo.address && (
                    <div className="flex items-center justify-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{contactInfo.address}</span>
                    </div>
                  )}
                  {contactInfo.whatsapp && (
                    <div className="flex items-center justify-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>{contactInfo.whatsapp}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 ${
                  textAlignment === 'center'
                    ? 'justify-center'
                    : textAlignment === 'right'
                      ? 'justify-end'
                      : 'justify-start'
                }`}
              >
                {actions.map(renderAction)}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`${textAlignStyles[textAlignment]} ${variant !== 'minimal' ? variantStyles[variant] : ''} rounded-lg p-8`}
          >
            <h2 className="mb-4 text-3xl font-bold">{title}</h2>
            {description && (
              <p className="mb-8 text-lg opacity-90 max-w-2xl mx-auto">{description}</p>
            )}

            {/* Contact Info */}
            {contactInfo && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {contactInfo.phone && (
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{contactInfo.phone}</span>
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{contactInfo.email}</span>
                  </div>
                )}
                {contactInfo.address && (
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{contactInfo.address}</span>
                  </div>
                )}
                {contactInfo.whatsapp && (
                  <div className="flex items-center justify-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{contactInfo.whatsapp}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 ${
                textAlignment === 'center'
                  ? 'justify-center'
                  : textAlignment === 'right'
                    ? 'justify-end'
                    : 'justify-start'
              }`}
            >
              {actions.map(renderAction)}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
