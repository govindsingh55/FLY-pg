'use client'

import * as Lucide from 'lucide-react'
import { properties } from '../../data'

export function PropertyCarousel() {
  return (
    <section id="properties" className="mx-auto max-w-6xl px-4 py-10">
      <h3 className="mb-4 text-xl font-semibold">Find your stay, your way</h3>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory]">
          {properties.map((p: any) => (
            <a
              key={p.id}
              href="#"
              className="min-w-[260px] scroll-snap-align-start rounded-xl border bg-card shadow-sm hover:shadow transition"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{p.name}</h4>
                  {p.rating ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Lucide.Star className="size-4 text-accent" />
                      <span>{p.rating.toFixed(1)}</span>
                    </div>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.area}
                  {p.city ? ` · ${p.city}` : ''}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.badges?.map((b: string) => (
                    <span key={b} className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs">
                      {b}
                    </span>
                  ))}
                </div>
                {p.priceFrom ? (
                  <p className="mt-2 text-sm">
                    From <span className="font-semibold">₹{p.priceFrom.toLocaleString()}</span>/mo
                  </p>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PropertyCarousel
