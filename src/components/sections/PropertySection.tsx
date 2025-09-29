import { cn } from '@/lib/utils'
import { JSX } from 'react'

interface PropertySectionProps {
  className?: string
  card?: boolean
  children: React.ReactNode
}

export const PropertySection = ({ className, card, children }: PropertySectionProps) => {
  return (
    <section
      className={cn(
        'mx-auto max-w-8xl px-4 pl-0 py-4',
        card ? 'card rounded-lg p-4 shadow-lg bg-card' : '',
        className,
      )}
    >
      {children}
    </section>
  )
}

interface PropertySectionTitleProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  children: React.ReactNode
}

export const PropertySectionTitle = ({
  className,
  children,
  as = 'h3',
}: PropertySectionTitleProps) => {
  const Tag = as as keyof JSX.IntrinsicElements
  return <Tag className={cn('mb-3 text-3xl font-semibold text-primary', className)}>{children}</Tag>
}

interface PropertySectionDescriptionProps {
  as?: 'p' | 'span' | 'div'
  className?: string
  children: React.ReactNode
}

export const PropertySectionDescription = ({
  className,
  children,
  as = 'p',
}: PropertySectionDescriptionProps) => {
  const Tag = as as keyof JSX.IntrinsicElements
  return <Tag className={cn('text-accent text-sm', className)}>{children}</Tag>
}

interface PropertySectionContentProps {
  className?: string
  children: React.ReactNode
}

export const PropertySectionContent = ({ className, children }: PropertySectionContentProps) => {
  return <div className={cn('mx-auto max-w-8xl px-4 pl-0 py-4', className)}>{children}</div>
}
