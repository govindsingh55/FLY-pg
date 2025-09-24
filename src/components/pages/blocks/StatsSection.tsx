import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface Stat {
  value: string
  label: string
  sublabel?: string
}

interface StatsSectionProps {
  stats: Stat[]
  variant?: 'default' | 'floating' | 'minimal' | 'cards'
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  showBorder?: boolean
  animate?: boolean
  // Enhanced styling options
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
}

export function StatsSection({
  stats,
  variant = 'default',
  backgroundColor = 'background',
  showBorder = true,
  animate = true,
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
}: StatsSectionProps) {
  const variantStyles = {
    default: 'py-8 bg-background/95 backdrop-blur-sm',
    floating: 'py-8 bg-background/95 backdrop-blur-sm -mt-16 relative z-10',
    minimal: 'py-12',
    cards: 'py-16',
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

  const cardStyles = {
    default: showBorder ? 'border-0 shadow-lg' : 'border-0 shadow-none',
    floating: showBorder ? 'border-0 shadow-lg' : 'border-0 shadow-none',
    minimal: 'border-0 shadow-none bg-transparent',
    cards: 'border-0 shadow-lg hover:shadow-xl transition-shadow',
  }

  const containerStyles = {
    default: 'mx-auto max-w-6xl px-6',
    floating: 'mx-auto max-w-6xl px-6',
    minimal: 'mx-auto max-w-4xl px-6',
    cards: 'mx-auto max-w-6xl px-6',
  }

  const renderStat = (stat: Stat, index: number) => {
    if (variant === 'cards') {
      return (
        <Card key={index} className={cardStyles[variant]}>
          <CardContent className="p-6 text-center">
            <div
              className={`text-3xl font-bold mb-2 ${animate ? 'animate-count-up' : ''} ${
                backgroundColor === 'primary' ? 'text-primary-foreground' : 'text-primary'
              }`}
            >
              {stat.value}
            </div>
            <div
              className={`text-sm font-medium ${
                backgroundColor === 'primary'
                  ? 'text-primary-foreground/80'
                  : 'text-muted-foreground'
              }`}
            >
              {stat.label}
            </div>
            {stat.sublabel && (
              <div
                className={`text-xs mt-1 ${
                  backgroundColor === 'primary'
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground/70'
                }`}
              >
                {stat.sublabel}
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

    return (
      <div key={index} className="text-center">
        <div
          className={`text-3xl font-bold mb-2 ${animate ? 'animate-count-up' : ''} ${
            backgroundColor === 'primary' ? 'text-primary-foreground' : 'text-primary'
          }`}
        >
          {stat.value}
        </div>
        <div
          className={`text-sm font-medium ${
            backgroundColor === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
          }`}
        >
          {stat.label}
        </div>
        {stat.sublabel && (
          <div
            className={`text-xs mt-1 ${
              backgroundColor === 'primary'
                ? 'text-primary-foreground/70'
                : 'text-muted-foreground/70'
            }`}
          >
            {stat.sublabel}
          </div>
        )}
      </div>
    )
  }

  const gridClasses = {
    default: 'grid grid-cols-1 md:grid-cols-3 gap-8',
    floating: 'grid grid-cols-1 md:grid-cols-3 gap-8',
    minimal: 'grid grid-cols-1 md:grid-cols-3 gap-8',
    cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  }

  return (
    <section className={`${paddingStyles[padding]} ${backgroundStyles[backgroundColor]}`}>
      <div className={`${maxWidthStyles[maxWidth]} mx-auto px-6`}>
        {variant === 'cards' ? (
          <div className={`${gridClasses[variant]} ${textAlignStyles[textAlignment]}`}>
            {stats.map(renderStat)}
          </div>
        ) : (
          <Card className={cardStyles[variant]}>
            <CardContent className="p-6">
              <div className={`${gridClasses[variant]} ${textAlignStyles[textAlignment]}`}>
                {stats.map(renderStat)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
