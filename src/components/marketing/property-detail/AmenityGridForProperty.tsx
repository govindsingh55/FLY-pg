import * as React from 'react'
import IconByName from '@/components/marketing/IconByName'
import type { Amenity } from '@/payload/payload-types'
import { cn } from '@/lib/utils'

export default function AmenityGridForProperty({
  align = 'left',
  items,
  headingClassName,
}: {
  items: (string | Amenity)[]
  headingClassName?: string
  align?: 'center' | 'left' | 'right'
}) {
  if (!items?.length) return null
  return (
    <section className="mx-auto max-w-8xl pl-0 py-4">
      <h3 className={cn('mb-3 text-3xl font-semibold text-primary', headingClassName)}>
        Amazing <span className="text-accent">Amenities</span>
      </h3>
      <div
        className={cn(
          'flex flex-wrap justify-center gap-1 md:gap-3',
          align === 'center'
            ? 'justify-center'
            : align === 'left'
              ? 'md:justify-start justify-center'
              : 'md:justify-end justify-center',
        )}
      >
        {items.map((item, index) => {
          const amenityName = typeof item === 'string' ? item : item.name || 'Unknown Amenity'
          const amenityIcon =
            typeof item === 'string' ? 'CheckCircle' : item.iconName || 'CheckCircle'
          const key = typeof item === 'string' ? item : item.id || index

          return (
            <div
              key={key}
              className="flex flex-col items-center justify-center gap-1 md:gap-2 rounded-lg border border-accent/35 bg-card px-2 py-3 md:px-3 md:py-4 text-center shadow-sm transition-all duration-200 hover:shadow-md hover:border-2 hover:border-accent hover:bg-accent/5 w-28 min-w-28 md:w-32 md:min-w-32 flex-shrink-0"
            >
              <IconByName name={amenityIcon} className="size-5 md:size-6 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary leading-tight">
                {amenityName}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
