import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

interface Feature {
  feature: string
  included: boolean
}

interface Plan {
  name: string
  price: string
  period?: string
  description?: string
  features: Feature[]
  ctaText?: string
  ctaUrl?: string
  highlighted?: boolean
}

interface PricingSectionProps {
  title: string
  subtitle?: string
  plans: Plan[]
  // Enhanced styling options
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  showBorder?: boolean
}

export function PricingSection({
  title,
  subtitle,
  plans,
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
  showBorder = false,
}: PricingSectionProps) {
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

  return (
    <section className={`${paddingStyles[padding]} px-4 ${backgroundStyles[backgroundColor]}`}>
      <div className={`${maxWidthStyles[maxWidth]} mx-auto`}>
        {showBorder ? (
          <div className={borderStyles}>
            <div className="p-8">
              <div className={`${textAlignStyles[textAlignment]} mb-12`}>
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                {subtitle && (
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan, index) => (
                  <Card
                    key={index}
                    className={`relative ${plan.highlighted ? 'border-primary shadow-lg scale-105' : ''}`}
                  >
                    {plan.highlighted && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                        Most Popular
                      </Badge>
                    )}

                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        {plan.period && (
                          <span className="text-muted-foreground">{plan.period}</span>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            {feature.included ? (
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                            <span
                              className={
                                feature.included ? '' : 'text-muted-foreground line-through'
                              }
                            >
                              {feature.feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {plan.ctaText && plan.ctaUrl && (
                        <Button
                          className="w-full mt-6"
                          variant={plan.highlighted ? 'default' : 'outline'}
                        >
                          {plan.ctaText}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={`${textAlignStyles[textAlignment]} mb-12`}>
              <h2 className="text-3xl font-bold mb-4">{title}</h2>
              {subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative ${plan.highlighted ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                          <span
                            className={feature.included ? '' : 'text-muted-foreground line-through'}
                          >
                            {feature.feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {plan.ctaText && plan.ctaUrl && (
                      <Button
                        className="w-full mt-6"
                        variant={plan.highlighted ? 'default' : 'outline'}
                      >
                        {plan.ctaText}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
