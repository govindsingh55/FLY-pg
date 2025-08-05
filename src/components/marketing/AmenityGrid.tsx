'use client'

import IconByName from './IconByName'
import { amenities } from '../../data'

export function AmenityGrid() {
  return (
    <section id="amenities" className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {amenities.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-2 rounded-xl border bg-card px-3 py-3 hover:border-primary/50 transition"
          >
            <IconByName name={a.icon} className="size-5 text-primary" />
            <span className="text-sm">{a.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AmenityGrid
