import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageSectionProps {
  image: unknown
  title?: string
  caption?: string
  altText?: string
  alignment?: 'left' | 'center' | 'right' | 'full'
  // Enhanced styling options
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  showBorder?: boolean
}

export function ImageSection({
  image,
  title,
  caption,
  altText,
  alignment = 'center',
  backgroundColor = 'transparent',
  padding = 'default',
  maxWidth = 'default',
  showBorder = false,
}: ImageSectionProps) {
  const alignmentClasses = {
    left: 'float-left mr-6 mb-4',
    center: 'mx-auto block',
    right: 'float-right ml-6 mb-4',
    full: 'w-full',
  }

  const containerClasses = {
    left: 'max-w-xs',
    center: 'max-w-4xl mx-auto',
    right: 'max-w-xs',
    full: 'w-full',
  }

  const backgroundStyles = {
    transparent: 'bg-transparent',
    background: 'bg-background',
    muted: 'bg-muted',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
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

  return (
    <section className={`${paddingStyles[padding]} px-4 ${backgroundStyles[backgroundColor]}`}>
      <div className={cn('mx-auto', maxWidthStyles[maxWidth])}>
        {showBorder ? (
          <div className={cn('p-8', borderStyles)}>
            {title && <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>}

            <div className={cn('relative', alignmentClasses[alignment])}>
              <Image
                src={image.url || image}
                alt={altText || title || caption || 'Image'}
                width={800}
                height={600}
                className="w-full h-auto rounded-lg"
                priority={alignment === 'full'}
              />

              {caption && (
                <p className="text-sm text-muted-foreground mt-2 text-center italic">{caption}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {title && <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>}

            <div className={cn('relative', alignmentClasses[alignment])}>
              <Image
                src={image.url || image}
                alt={altText || title || caption || 'Image'}
                width={800}
                height={600}
                className="w-full h-auto rounded-lg"
                priority={alignment === 'full'}
              />

              {caption && (
                <p className="text-sm text-muted-foreground mt-2 text-center italic">{caption}</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
