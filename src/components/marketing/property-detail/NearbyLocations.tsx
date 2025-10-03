import * as React from 'react'

export default function NearbyLocations({
  locations,
}: {
  locations: { name: string; distance: string }[]
}) {
  if (!locations?.length) return null
  return (
    <section className="mx-auto max-w-8xl pl-0 py-4">
      <h3 className="mb-3 text-3xl font-semibold text-primary text-center md:text-left">
        Nearby <span className="text-accent">Locations</span>
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {locations.map((l, i) => (
          <div key={i} className="rounded-lg border border-accent/35 bg-card p-3 text-sm">
            <div className="font-medium">{l.name}</div>
            <div className="text-muted-foreground">{l.distance}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
