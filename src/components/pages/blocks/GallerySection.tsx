import React from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface GalleryImage {
  image: unknown
  title?: string
  caption?: string
  badge?: string
}

interface GallerySectionProps {
  title: string
  subtitle?: string
  images: GalleryImage[]
  columns?: '2' | '3' | '4' | '5'
  // Enhanced styling options
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  showBorder?: boolean
}

export function GallerySection({
  title,
  subtitle,
  images,
  columns = '4',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
  showBorder = false,
}: GallerySectionProps) {
  const gridCols = {
    '2': 'grid-cols-2',
    '3': 'grid-cols-2 md:grid-cols-3',
    '4': 'grid-cols-2 md:grid-cols-4',
    '5': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
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

              <div className={`grid gap-4 ${gridCols[columns]}`}>
                {images.map((item, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl border bg-card"
                  >
                    <Image
                      src={item.image.url || item.image}
                      alt={item.title || item.caption || 'Gallery image'}
                      width={400}
                      height={300}
                      className="h-44 w-full object-cover transition group-hover:scale-105"
                    />
                    {item.badge && <Badge className="absolute left-2 top-2">{item.badge}</Badge>}
                    {(item.title || item.caption) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        {item.title && (
                          <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                        )}
                        {item.caption && <p className="text-white/90 text-xs">{item.caption}</p>}
                      </div>
                    )}
                  </div>
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

            <div className={`grid gap-4 ${gridCols[columns]}`}>
              {images.map((item, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border bg-card"
                >
                  <Image
                    src={item.image.url || item.image}
                    alt={item.title || item.caption || 'Gallery image'}
                    width={400}
                    height={300}
                    className="h-44 w-full object-cover transition group-hover:scale-105"
                  />
                  {item.badge && <Badge className="absolute left-2 top-2">{item.badge}</Badge>}
                  {(item.title || item.caption) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      {item.title && (
                        <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                      )}
                      {item.caption && <p className="text-white/90 text-xs">{item.caption}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
