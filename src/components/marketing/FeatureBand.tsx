'use client'

import FeatureTile from './FeatureTile'
import { features } from '../../data'

export function FeatureBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Why Choose FLY?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience the perfect blend of comfort, community, and convenience across our properties.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {features.slice(0, 1).map((f: any) => (
          <FeatureTile key={f.id} {...f} className="md:row-span-2 h-full" />
        ))}
        {features.slice(1).map((f: any) => (
          <FeatureTile key={f.id} {...f} />
        ))}
      </div>
    </section>
  )
}

export default FeatureBand
