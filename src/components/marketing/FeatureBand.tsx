'use client'

import FeatureTile from './FeatureTile'
import { features } from '../../data'

export function FeatureBand() {
  return (
    <section className="mx-auto max-w-8xl px-4 py-20 lg:py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Why Choose FLY?</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Experience the perfect blend of comfort, community, and convenience across our
          thoughtfully designed properties.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 md:items-stretch">
        {/* Large featured card */}
        <div>
          {features.slice(0, 1).map((f: any) => (
            <FeatureTile key={f.id} {...f} className="h-full" />
          ))}
        </div>

        {/* Smaller cards stack - takes full remaining height */}
        <div className="flex flex-col gap-8 lg:gap-10 h-full">
          {features.slice(1).map((f: any, index) => (
            <FeatureTile key={f.id} {...f} className="flex-1" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureBand
