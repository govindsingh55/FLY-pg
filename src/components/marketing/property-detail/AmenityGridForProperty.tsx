import * as React from 'react'
import IconByName from '@/components/marketing/IconByName'
import type { Amenity } from '@/payload/payload-types'
import { cn } from '@/lib/utils'

export default function AmenityGridForProperty({
  items,
  headingClassName,
}: {
  items: (string | Amenity)[]
  headingClassName?: string
}) {
  if (!items?.length) return null
  console.log('[AmenityGridForProperty] items:', items)
  return (
    <section className="mx-auto max-w-8xl px-4 pl-0 py-4">
      <h3 className={cn('mb-3 text-2xl font-semibold text-primary', headingClassName)}>
        Amazing <span className="text-accent">Amenities</span>
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((item, index) => {
          const amenityName = typeof item === 'string' ? item : item.name || 'Unknown Amenity'
          const amenityIcon =
            typeof item === 'string' ? 'CheckCircle' : item.iconName || 'CheckCircle'
          const key = typeof item === 'string' ? item : item.id || index

          return (
            <div
              key={key}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-primary bg-card px-3 py-4 text-center shadow-sm transition-all duration-200 hover:shadow-md hover:border-accent hover:bg-accent/5 w-32 min-w-32 flex-shrink-0"
            >
              <IconByName name={amenityIcon} className="size-6 text-primary" />
              <span className="text-sm font-medium text-foreground leading-tight">
                {amenityName}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
