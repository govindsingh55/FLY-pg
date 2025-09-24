import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

interface MediaItem {
  image: string
  caption?: string
  alt?: string
  isCover?: boolean
}

interface MediaSectionProps {
  title?: string
  description?: string
  media: MediaItem[]
  layout?: 'grid' | 'carousel' | 'masonry' | 'single'
  columns?: '2' | '3' | '4' | '5'
  aspectRatio?: 'auto' | 'square' | 'landscape' | 'portrait'
  showCaptions?: boolean
  enableLightbox?: boolean
  variant?: 'default' | 'rounded' | 'bordered' | 'shadow'
  // Enhanced styling options
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  showBorder?: boolean
}

export function MediaSection({
  title,
  description,
  media,
  layout = 'grid',
  columns = '3',
  aspectRatio = 'auto',
  showCaptions = false,
  enableLightbox = true,
  variant = 'default',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
  showBorder = false,
}: MediaSectionProps) {
  const columnClasses = {
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    '5': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  }

  const aspectRatioClasses = {
    auto: 'aspect-auto',
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[4/5]',
  }

  const variantStyles = {
    default: '',
    rounded: 'rounded-lg',
    bordered: 'border border-border',
    shadow: 'shadow-lg',
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

  const borderStyles = showBorder ? 'border border-border rounded-lg' : ''

  const renderMediaItem = (item: MediaItem, index: number) => {
    const mediaContent = (
      <div className={`relative overflow-hidden ${variantStyles[variant]}`}>
        <Image
          src={item.image}
          alt={item.alt || item.caption || ''}
          width={400}
          height={300}
          className={`w-full h-full object-cover transition-transform hover:scale-105 ${
            enableLightbox ? 'cursor-pointer' : ''
          }`}
          onClick={() => {
            if (enableLightbox) {
              // TODO: Implement lightbox functionality
              console.log('Lightbox clicked for image:', item.image)
            }
          }}
        />
        {showCaptions && item.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
            {item.caption}
          </div>
        )}
      </div>
    )

    if (layout === 'single') {
      return (
        <div key={index} className="mx-auto max-w-2xl">
          {mediaContent}
        </div>
      )
    }

    return (
      <div key={index} className={`${aspectRatioClasses[aspectRatio]}`}>
        {mediaContent}
      </div>
    )
  }

  if (layout === 'single') {
    return (
      <section className={`${paddingStyles[padding]} ${backgroundStyles[backgroundColor]}`}>
        <div className={`${maxWidthStyles[maxWidth]} mx-auto px-6`}>
          {showBorder ? (
            <div className={borderStyles}>
              <div className="p-8">
                {title && (
                  <div className={`mb-8 ${textAlignStyles[textAlignment]}`}>
                    <h2 className="mb-4 text-3xl font-bold tracking-tight">{title}</h2>
                    {description && (
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {description}
                      </p>
                    )}
                  </div>
                )}
                {media.length > 0 && renderMediaItem(media[0], 0)}
              </div>
            </div>
          ) : (
            <>
              {title && (
                <div className={`mb-8 ${textAlignStyles[textAlignment]}`}>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight">{title}</h2>
                  {description && (
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
                  )}
                </div>
              )}
              {media.length > 0 && renderMediaItem(media[0], 0)}
            </>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className={`${paddingStyles[padding]} ${backgroundStyles[backgroundColor]}`}>
      <div className={`${maxWidthStyles[maxWidth]} mx-auto px-6`}>
        {showBorder ? (
          <div className={borderStyles}>
            <div className="p-8">
              {title && (
                <div className={`mb-8 ${textAlignStyles[textAlignment]}`}>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight">{title}</h2>
                  {description && (
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
                  )}
                </div>
              )}

              {layout === 'carousel' ? (
                <div className="relative">
                  {/* TODO: Implement carousel functionality */}
                  <div className={`grid ${columnClasses[columns]} gap-6`}>
                    {media.map(renderMediaItem)}
                  </div>
                </div>
              ) : layout === 'masonry' ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                  {media.map((item, index) => (
                    <div key={index} className="break-inside-avoid">
                      {renderMediaItem(item, index)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`grid ${columnClasses[columns]} gap-6`}>
                  {media.map(renderMediaItem)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {title && (
              <div className={`mb-8 ${textAlignStyles[textAlignment]}`}>
                <h2 className="mb-4 text-3xl font-bold tracking-tight">{title}</h2>
                {description && (
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
                )}
              </div>
            )}

            {layout === 'carousel' ? (
              <div className="relative">
                {/* TODO: Implement carousel functionality */}
                <div className={`grid ${columnClasses[columns]} gap-6`}>
                  {media.map(renderMediaItem)}
                </div>
              </div>
            ) : layout === 'masonry' ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {media.map((item, index) => (
                  <div key={index} className="break-inside-avoid">
                    {renderMediaItem(item, index)}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid ${columnClasses[columns]} gap-6`}>
                {media.map(renderMediaItem)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
