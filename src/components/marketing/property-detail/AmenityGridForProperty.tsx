import * as React from 'react'
import IconByName from '@/components/marketing/IconByName'
import type { Amenity } from '@/payload/payload-types'

export default function AmenityGridForProperty({ items }: { items: (string | Amenity)[] }) {
  if (!items?.length) return null
  console.log('[AmenityGridForProperty] items:', items)
  return (
    <section className="mx-auto max-w-8xl px-4 pl-0 py-4">
      <h3 className="mb-3 text-lg font-semibold text-primary">Amenities</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item, index) => {
          const amenityName = typeof item === 'string' ? item : item.name || 'Unknown Amenity'
          const amenityIcon =
            typeof item === 'string' ? 'CheckCircle' : item.iconName || 'CheckCircle'
          const key = typeof item === 'string' ? item : item.id || index

          return (
            <div key={key} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
              <IconByName name={amenityIcon} className="size-4 text-primary" />
              <span className="text-sm">{amenityName}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
