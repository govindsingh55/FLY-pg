import React from 'react'
import { RichText } from '@/components/RichText'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ContentSectionProps {
  title: string
  content?: unknown
  image?: unknown
  // Layout and styling options
  variant?: 'default' | 'narrow' | 'wide' | 'centered'
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  textAlignment?: 'left' | 'center' | 'right'
  showBorder?: boolean
  padding?: 'small' | 'default' | 'large' | 'xl'
  imagePosition?: 'left' | 'right' | 'top' | 'bottom'
  imageSize?: 'small' | 'medium' | 'large' | 'full'
}

export function ContentSection({
  title,
  content,
  image,
  variant = 'default',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  showBorder = false,
  padding = 'default',
  imagePosition = 'right',
  imageSize = 'medium',
}: ContentSectionProps) {
  // Determine layout based on content and image
  const hasImage = image && (image.url || image)
  const hasContent = content

  // Style configurations
  const variantStyles = {
    default: 'max-w-4xl',
    narrow: 'max-w-2xl',
    wide: 'max-w-6xl',
    centered: 'max-w-4xl',
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

  const imageSizeStyles = {
    small: { width: 400, height: 300 },
    medium: { width: 600, height: 400 },
    large: { width: 800, height: 600 },
    full: { width: 1200, height: 800 },
  }

  const borderStyles = showBorder ? 'border border-border rounded-lg' : ''

  // Get image dimensions
  const imageDimensions = imageSizeStyles[imageSize]

  // Render content based on layout
  const renderContent = () => {
    if (!hasContent) return null

    return (
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <RichText data={content} />
      </div>
    )
  }

  // Render image
  const renderImage = () => {
    if (!hasImage) return null

    return (
      <div className="relative">
        <Image
          src={image.url || image}
          alt={title || 'Content image'}
          width={imageDimensions.width}
          height={imageDimensions.height}
          className={cn(
            'w-full h-auto rounded-lg shadow-lg',
            imageSize === 'full' && 'object-cover',
          )}
        />
      </div>
    )
  }

  // Determine layout structure
  const getLayoutStructure = () => {
    if (!hasImage && !hasContent) {
      return (
        <div className="text-center">
          <p className="text-muted-foreground">No content added yet.</p>
        </div>
      )
    }

    if (!hasImage) {
      // Content only
      return <div className="max-w-4xl mx-auto">{renderContent()}</div>
    }

    if (!hasContent) {
      // Image only
      return <div className="max-w-4xl mx-auto">{renderImage()}</div>
    }

    // Both content and image - determine layout
    if (imagePosition === 'top' || imagePosition === 'bottom') {
      // Vertical layout
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          {imagePosition === 'top' && renderImage()}
          {renderContent()}
          {imagePosition === 'bottom' && renderImage()}
        </div>
      )
    }

    // Horizontal layout (left/right)
    const isImageLeft = imagePosition === 'left'
    return (
      <div
        className={cn(
          'grid gap-8 lg:gap-12 items-center',
          isImageLeft ? 'lg:grid-cols-[1fr,2fr]' : 'lg:grid-cols-[2fr,1fr]',
        )}
      >
        {isImageLeft && renderImage()}
        {renderContent()}
        {!isImageLeft && renderImage()}
      </div>
    )
  }

  return (
    <section className={cn(paddingStyles[padding], backgroundStyles[backgroundColor])}>
      <div className="mx-auto px-6">
        <div className={cn(variantStyles[variant], 'mx-auto', textAlignStyles[textAlignment])}>
          {showBorder ? (
            <div className={cn('p-8', borderStyles)}>
              <h2 className="mb-6 text-3xl font-bold tracking-tight">{title}</h2>
              {getLayoutStructure()}
            </div>
          ) : (
            <>
              <h2 className="mb-8 text-3xl font-bold tracking-tight">{title}</h2>
              {getLayoutStructure()}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
