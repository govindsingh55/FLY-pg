import React from 'react'

interface SpacerSectionProps {
  height: 'small' | 'medium' | 'large' | 'xlarge'
}

export function SpacerSection({ height }: SpacerSectionProps) {
  const heightClasses = {
    small: 'h-8', // 2rem
    medium: 'h-16', // 4rem
    large: 'h-24', // 6rem
    xlarge: 'h-32', // 8rem
  }

  return <div className={heightClasses[height]} />
}
