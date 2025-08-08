import * as React from 'react'
import IconByName from '@/components/marketing/IconByName'

export default function AmenityGridForProperty({ items }: { items: string[] }) {
  if (!items?.length) return null
  return (
    <section className="mx-auto max-w-6xl px-4 pl-0 py-4">
      <h3 className="mb-3 text-lg font-semibold text-primary">Amenities</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {items.map((a) => (
          <div key={a} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
            <IconByName name="CheckCircle" className="size-4 text-primary" />
            <span className="text-sm">{a}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
