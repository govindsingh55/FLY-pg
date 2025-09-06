import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Logo {
  name: string
  logo: unknown
  url?: string
}

interface PressSectionProps {
  title: string
  subtitle?: string
  logos: Logo[]
  style?: 'grayscale' | 'color' | 'monochrome'
  // Enhanced styling options
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  showBorder?: boolean
}

export function PressSection({
  title,
  subtitle,
  logos,
  style = 'grayscale',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
  showBorder = false,
}: PressSectionProps) {
  const getLogoStyle = () => {
    switch (style) {
      case 'grayscale':
        return 'grayscale hover:grayscale-0 transition'
      case 'monochrome':
        return 'brightness-0 hover:brightness-100 transition'
      default:
        return 'hover:opacity-80 transition'
    }
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
    wide: 'max-w-7xl',
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

              <div
                className={`flex flex-wrap items-center gap-6 ${
                  textAlignment === 'center'
                    ? 'justify-center'
                    : textAlignment === 'right'
                      ? 'justify-end'
                      : 'justify-start'
                }`}
              >
                {logos.map((logo, index) => {
                  const logoElement = (
                    <Image
                      src={logo.logo.url || logo.logo}
                      alt={logo.name}
                      width={120}
                      height={48}
                      className={`h-12 w-auto object-contain ${getLogoStyle()}`}
                      loading="lazy"
                    />
                  )

                  return logo.url ? (
                    <Link
                      key={index}
                      href={logo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-70 hover:opacity-100 transition"
                    >
                      {logoElement}
                    </Link>
                  ) : (
                    <div key={index} className="opacity-70">
                      {logoElement}
                    </div>
                  )
                })}
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

            <div
              className={`flex flex-wrap items-center gap-6 ${
                textAlignment === 'center'
                  ? 'justify-center'
                  : textAlignment === 'right'
                    ? 'justify-end'
                    : 'justify-start'
              }`}
            >
              {logos.map((logo, index) => {
                const logoElement = (
                  <Image
                    src={logo.logo.url || logo.logo}
                    alt={logo.name}
                    width={120}
                    height={48}
                    className={`h-12 w-auto object-contain ${getLogoStyle()}`}
                    loading="lazy"
                  />
                )

                return logo.url ? (
                  <Link
                    key={index}
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-70 hover:opacity-100 transition"
                  >
                    {logoElement}
                  </Link>
                ) : (
                  <div key={index} className="opacity-70">
                    {logoElement}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
