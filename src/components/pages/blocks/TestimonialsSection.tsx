import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import Image from 'next/image'

interface Testimonial {
  name: string
  role?: string
  text: string
  avatar?: any
  tag?: string
  rating?: number
}

interface TestimonialsSectionProps {
  title: string
  subtitle?: string
  testimonials: Testimonial[]
  layout?: 'grid' | 'carousel' | 'wall'
  // Enhanced styling options
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  showBorder?: boolean
}

export function TestimonialsSection({
  title,
  subtitle,
  testimonials,
  layout = 'grid',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
  showBorder = false,
}: TestimonialsSectionProps) {
  // Style configurations
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

  const borderStyles = showBorder ? 'border border-border rounded-lg' : ''

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const renderTestimonial = (testimonial: Testimonial, index: number) => (
    <Card key={index} className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {testimonial.avatar && (
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={testimonial.avatar.url || testimonial.avatar}
                alt={testimonial.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="font-semibold text-sm">{testimonial.name}</div>
            {testimonial.role && (
              <div className="text-xs text-muted-foreground">{testimonial.role}</div>
            )}
            {testimonial.rating && (
              <div className="flex gap-1 mt-1">{renderStars(testimonial.rating)}</div>
            )}
          </div>
        </div>

        <p className="text-sm mb-3">{testimonial.text}</p>

        {testimonial.tag && (
          <Badge variant="secondary" className="text-xs">
            {testimonial.tag}
          </Badge>
        )}
      </CardContent>
    </Card>
  )

  return (
    <section className={`${paddingStyles[padding]} px-4 ${backgroundStyles[backgroundColor]}`}>
      <div className={`${maxWidthStyles[maxWidth]} mx-auto`}>
        {showBorder ? (
          <div className={`p-8 ${borderStyles}`}>
            <div className={`mb-12 ${textAlignStyles[textAlignment]}`}>
              <h2 className="text-3xl font-bold mb-4">{title}</h2>
              {subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
              )}
            </div>

            {layout === 'grid' && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => renderTestimonial(testimonial, index))}
              </div>
            )}

            {layout === 'wall' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="rounded-xl border bg-card p-4">
                    <div className="text-sm font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    <p className="mt-2 text-sm">{testimonial.text}</p>
                    {testimonial.tag && (
                      <span className="mt-3 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                        {testimonial.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {layout === 'carousel' && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => renderTestimonial(testimonial, index))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={`mb-12 ${textAlignStyles[textAlignment]}`}>
              <h2 className="text-3xl font-bold mb-4">{title}</h2>
              {subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
              )}
            </div>

            {layout === 'grid' && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => renderTestimonial(testimonial, index))}
              </div>
            )}

            {layout === 'wall' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="rounded-xl border bg-card p-4">
                    <div className="text-sm font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    <p className="mt-2 text-sm">{testimonial.text}</p>
                    {testimonial.tag && (
                      <span className="mt-3 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                        {testimonial.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {layout === 'carousel' && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => renderTestimonial(testimonial, index))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
