import React from 'react'
import { RichText } from '@/components/RichText'
import { cn } from '@/lib/utils'

interface TextSectionProps {
  title?: string
  content: unknown
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  maxWidth?: 'full' | 'narrow' | 'medium' | 'wide'
  // Enhanced styling options
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  padding?: 'small' | 'default' | 'large' | 'xl'
  showBorder?: boolean
}

export function TextSection({
  title,
  content,
  textAlign = 'left',
  maxWidth = 'medium',
  backgroundColor = 'transparent',
  padding = 'default',
  showBorder = false,
}: TextSectionProps) {
  const maxWidthClasses = {
    full: 'max-w-none',
    narrow: 'max-w-2xl',
    medium: 'max-w-4xl',
    wide: 'max-w-6xl',
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
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

  const borderStyles = showBorder ? 'border border-border rounded-lg' : ''

  return (
    <section className={`${paddingStyles[padding]} px-4 ${backgroundStyles[backgroundColor]}`}>
      <div className={cn('mx-auto', maxWidthClasses[maxWidth])}>
        {showBorder ? (
          <div className={cn('p-8', borderStyles)}>
            {title && (
              <h2 className={cn('text-3xl font-bold mb-6', alignClasses[textAlign])}>{title}</h2>
            )}
            <div
              className={cn('prose prose-lg max-w-none dark:prose-invert', alignClasses[textAlign])}
            >
              <RichText data={content} />
            </div>
          </div>
        ) : (
          <>
            {title && (
              <h2 className={cn('text-3xl font-bold mb-6', alignClasses[textAlign])}>{title}</h2>
            )}
            <div
              className={cn('prose prose-lg max-w-none dark:prose-invert', alignClasses[textAlign])}
            >
              <RichText data={content} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
