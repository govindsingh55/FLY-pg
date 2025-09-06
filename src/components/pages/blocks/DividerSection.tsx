import React from 'react'
import { cn } from '@/lib/utils'

interface DividerSectionProps {
  style: 'solid' | 'dashed' | 'dotted' | 'gradient'
  thickness: 'thin' | 'medium' | 'thick'
  color: 'default' | 'primary' | 'secondary' | 'muted'
}

export function DividerSection({ style, thickness, color }: DividerSectionProps) {
  const thicknessClasses = {
    thin: 'h-px',
    medium: 'h-0.5',
    thick: 'h-1',
  }

  const colorClasses = {
    default: 'bg-border',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    muted: 'bg-muted',
  }

  const styleClasses = {
    solid: '',
    dashed: 'border-dashed border-t-0 border-l-0 border-r-0',
    dotted: 'border-dotted border-t-0 border-l-0 border-r-0',
    gradient: 'bg-gradient-to-r from-transparent via-border to-transparent',
  }

  if (style === 'gradient') {
    return (
      <div className="py-8 px-4">
        <div className={cn('w-full', thicknessClasses[thickness], styleClasses[style])} />
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div
        className={cn(
          'w-full',
          thicknessClasses[thickness],
          colorClasses[color],
          styleClasses[style],
        )}
      />
    </div>
  )
}
