'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { cn } from '../../lib/utils'
import { Button } from '../../components/ui/button'

export type FeatureTileProps = {
  id: string
  title: string
  subtitle?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  imageUrl: string
  accent?: 'sage' | 'plum' | 'rust' | 'taupe' | 'cream' | 'inky'
  className?: string
}

export default function FeatureTile(props: FeatureTileProps) {
  const { accentStyles, gradientOverlay, buttonVariant, patternColor } = useMemo(() => {
    switch (props.accent) {
      case 'sage':
        return {
          accentStyles:
            'bg-gradient-to-br from-[#8aa17f]/12 via-[#8aa17f]/6 to-[#8aa17f]/3 border-[#8aa17f]/25 dark:from-[#90a88a]/18 dark:via-[#90a88a]/10 dark:to-[#90a88a]/5 dark:border-[#90a88a]/35',
          gradientOverlay:
            'bg-gradient-to-t from-[#8aa17f]/25 via-[#8aa17f]/8 to-transparent dark:from-[#90a88a]/35 dark:via-[#90a88a]/12',
          buttonVariant:
            'bg-[#8aa17f] hover:bg-[#8aa17f]/90 dark:bg-[#90a88a] dark:hover:bg-[#90a88a]/90 text-white shadow-lg shadow-[#8aa17f]/20 dark:shadow-[#90a88a]/20',
          patternColor: '#8aa17f',
        }
      case 'plum':
        return {
          accentStyles:
            'bg-gradient-to-br from-[#4a2a3b]/12 via-[#4a2a3b]/6 to-[#4a2a3b]/3 border-[#4a2a3b]/25 dark:from-[#5b3549]/18 dark:via-[#5b3549]/10 dark:to-[#5b3549]/5 dark:border-[#5b3549]/35',
          gradientOverlay:
            'bg-gradient-to-t from-[#4a2a3b]/25 via-[#4a2a3b]/8 to-transparent dark:from-[#5b3549]/35 dark:via-[#5b3549]/12',
          buttonVariant:
            'bg-[#4a2a3b] hover:bg-[#4a2a3b]/90 dark:bg-[#5b3549] dark:hover:bg-[#5b3549]/90 text-white shadow-lg shadow-[#4a2a3b]/20 dark:shadow-[#5b3549]/20',
          patternColor: '#4a2a3b',
        }
      case 'rust':
        return {
          accentStyles:
            'bg-gradient-to-br from-[#a14e3b]/12 via-[#a14e3b]/6 to-[#a14e3b]/3 border-[#a14e3b]/25 dark:from-[#b15843]/18 dark:via-[#b15843]/10 dark:to-[#b15843]/5 dark:border-[#b15843]/35',
          gradientOverlay:
            'bg-gradient-to-t from-[#a14e3b]/25 via-[#a14e3b]/8 to-transparent dark:from-[#b15843]/35 dark:via-[#b15843]/12',
          buttonVariant:
            'bg-[#a14e3b] hover:bg-[#a14e3b]/90 dark:bg-[#b15843] dark:hover:bg-[#b15843]/90 text-white shadow-lg shadow-[#a14e3b]/20 dark:shadow-[#b15843]/20',
          patternColor: '#a14e3b',
        }
      case 'taupe':
        return {
          accentStyles:
            'bg-gradient-to-br from-[#b4a38f]/15 via-[#b4a38f]/8 to-[#b4a38f]/4 border-[#b4a38f]/30 dark:from-[#c1b29f]/20 dark:via-[#c1b29f]/12 dark:to-[#c1b29f]/6 dark:border-[#c1b29f]/40',
          gradientOverlay:
            'bg-gradient-to-t from-[#b4a38f]/30 via-[#b4a38f]/10 to-transparent dark:from-[#c1b29f]/40 dark:via-[#c1b29f]/15',
          buttonVariant:
            'bg-[#b4a38f] hover:bg-[#b4a38f]/90 dark:bg-[#c1b29f] dark:hover:bg-[#c1b29f]/90 text-white shadow-lg shadow-[#b4a38f]/20 dark:shadow-[#c1b29f]/20',
          patternColor: '#b4a38f',
        }
      case 'cream':
        return {
          accentStyles:
            'bg-gradient-to-br from-[#efe7d7]/25 via-[#efe7d7]/15 to-[#efe7d7]/8 border-[#efe7d7]/40 dark:from-[#f0e8d9]/20 dark:via-[#f0e8d9]/12 dark:to-[#f0e8d9]/6 dark:border-[#f0e8d9]/30',
          gradientOverlay:
            'bg-gradient-to-t from-[#efe7d7]/35 via-[#efe7d7]/15 to-transparent dark:from-[#f0e8d9]/25 dark:via-[#f0e8d9]/10',
          buttonVariant:
            'bg-[#183a2c] hover:bg-[#183a2c]/90 dark:bg-[#2a5a46] dark:hover:bg-[#2a5a46]/90 text-[#e8f1ec] shadow-lg shadow-[#183a2c]/20',
          patternColor: '#efe7d7',
        }
      case 'inky':
        return {
          accentStyles:
            'bg-gradient-to-br from-[#2a3b49]/12 via-[#2a3b49]/6 to-[#2a3b49]/3 border-[#2a3b49]/25 dark:from-[#334959]/18 dark:via-[#334959]/10 dark:to-[#334959]/5 dark:border-[#334959]/35',
          gradientOverlay:
            'bg-gradient-to-t from-[#2a3b49]/25 via-[#2a3b49]/8 to-transparent dark:from-[#334959]/35 dark:via-[#334959]/12',
          buttonVariant:
            'bg-[#2a3b49] hover:bg-[#2a3b49]/90 dark:bg-[#334959] dark:hover:bg-[#334959]/90 text-white shadow-lg shadow-[#2a3b49]/20 dark:shadow-[#334959]/20',
          patternColor: '#2a3b49',
        }
      default:
        return {
          accentStyles:
            'bg-gradient-to-br from-[#183a2c]/8 via-[#183a2c]/4 to-[#183a2c]/2 border-[#183a2c]/20 dark:from-[#2a5a46]/15 dark:via-[#2a5a46]/8 dark:to-[#2a5a46]/4 dark:border-[#2a5a46]/30',
          gradientOverlay:
            'bg-gradient-to-t from-[#183a2c]/20 via-[#183a2c]/5 to-transparent dark:from-[#2a5a46]/30 dark:via-[#2a5a46]/10',
          buttonVariant:
            'bg-[#183a2c] hover:bg-[#183a2c]/90 dark:bg-[#2a5a46] dark:hover:bg-[#2a5a46]/90 text-[#e8f1ec] shadow-lg shadow-[#183a2c]/20',
          patternColor: '#183a2c',
        }
    }
  }, [props.accent])

  // Check if this is the first card (large card)
  const isLargeCard = props.className?.includes('h-full') && props.id === 'find-easy'

  if (isLargeCard) {
    // Enhanced layout for the large hero card
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-3xl border-2 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] transform-gpu h-full min-h-[600px] flex flex-col',
          accentStyles,
          props.className,
        )}
      >
        {/* Image Section - Enhanced with better overlay */}
        <div className="relative flex-1 min-h-[350px] overflow-hidden">
          <img
            src={props.imageUrl}
            alt={props.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          {/* Enhanced gradient overlay */}
          <div className={cn('absolute inset-0', gradientOverlay)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent dark:from-black/70" />
        </div>

        {/* Content Section - Redesigned with better spacing */}
        <div className="p-8 lg:p-10 relative bg-card/95 backdrop-blur-sm">
          {/* Enhanced background with brand color integration */}
          <div className="absolute inset-0 opacity-40">
            <div className={cn('w-full h-full', accentStyles)} />
            {/* Decorative pattern using brand colors */}
            <div
              className="absolute top-6 right-6 w-24 h-24 rounded-full opacity-20"
              style={{ backgroundColor: patternColor }}
            />
            <div
              className="absolute bottom-8 left-8 w-16 h-16 rounded-full opacity-15"
              style={{ backgroundColor: patternColor }}
            />
          </div>

          <div className="relative z-10">
            {props.subtitle && (
              <span
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-md mb-6 transition-all duration-300"
                style={{
                  backgroundColor: `${patternColor}15`,
                  borderColor: `${patternColor}40`,
                  color: patternColor,
                }}
              >
                {props.subtitle}
              </span>
            )}
            <h3 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight tracking-tight text-foreground">
              {props.title}
            </h3>
            {props.description && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {props.description}
              </p>
            )}

            {/* CTA Button - Enhanced styling with brand colors */}
            {props.ctaLabel && (
              <Button
                asChild
                size="lg"
                className={cn(
                  'group/btn px-8 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 border-0',
                  buttonVariant,
                )}
              >
                <Link href={props.ctaHref ?? '#'} className="flex items-center gap-2">
                  {props.ctaLabel}
                  <svg
                    className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Enhanced layout for standard cards
  return (
    <div
      className={cn(
        'group rounded-2xl border overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 h-full',
        // Remove fixed min-height when using flex-1 to allow full expansion
        props.className?.includes('flex-1') ? '' : 'min-h-[280px]',
        accentStyles,
        props.className,
      )}
    >
      <div className="grid md:grid-cols-2 gap-0 h-full">
        {/* Content Section */}
        <div className="p-6 lg:p-8 flex flex-col justify-between relative">
          {/* Enhanced background pattern with brand colors */}
          <div className="absolute top-0 right-0 w-20 h-20 opacity-15 overflow-hidden">
            <div
              className="w-full h-full rounded-full transform rotate-45"
              style={{ backgroundColor: patternColor }}
            />
          </div>
          <div className="absolute bottom-0 left-0 w-12 h-12 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: patternColor }} />
          </div>

          <div className="relative z-10 flex-1">
            {props.subtitle && (
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm mb-3 transition-all duration-300"
                style={{
                  backgroundColor: `${patternColor}12`,
                  borderColor: `${patternColor}30`,
                  color: patternColor,
                }}
              >
                {props.subtitle}
              </span>
            )}
            <h3 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight tracking-tight text-foreground">
              {props.title}
            </h3>
            {props.description && (
              <p className="text-muted-foreground leading-relaxed mb-6">{props.description}</p>
            )}
          </div>

          {props.ctaLabel && (
            <div className="relative z-10">
              <Button
                asChild
                size="lg"
                className={cn(
                  'group/btn font-semibold rounded-xl transition-all duration-300 hover:scale-105 border-0',
                  buttonVariant,
                )}
              >
                <Link href={props.ctaHref ?? '#'} className="flex items-center gap-2">
                  {props.ctaLabel}
                  <svg
                    className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Image Section */}
        <div className="relative h-48 md:h-full min-h-[200px] overflow-hidden order-first md:order-last">
          <img
            src={props.imageUrl}
            alt={props.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          {/* Enhanced overlay with brand color integration */}
          <div className={cn('absolute inset-0 opacity-50', gradientOverlay)} />
          {/* Decorative accent border */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ backgroundColor: patternColor }}
          />
        </div>
      </div>
    </div>
  )
}
