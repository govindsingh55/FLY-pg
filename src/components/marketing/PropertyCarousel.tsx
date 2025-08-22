'use client'

import * as Lucide from 'lucide-react'
import { useState, useEffect } from 'react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { properties } from '../../data'

export function PropertyCarousel() {
  const [api, setApi] = useState<CarouselApi | null>(null)
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    if (!api) return
    const init = () => {
      const snaps = api.scrollSnapList()
      setCount(snaps.length)
      const idx = api.selectedScrollSnap()
      setCurrent(idx)
      setCanPrev(idx > 0)
      setCanNext(idx < snaps.length - 1)
    }
    const onSelect = () => {
      const idx = api.selectedScrollSnap()
      setCurrent(idx)
      setCanPrev(idx > 0)
      setCanNext(idx < api.scrollSnapList().length - 1)
    }
    api.on('select', onSelect)
    api.on('reInit', init)
    init()
    return () => {
      api.off('select', onSelect)
      api.off('reInit', init)
    }
  }, [api])

  return (
    <section id="properties" className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-4">
        <h3 className="text-xl font-semibold">Find your stay, your way</h3>
      </header>
      <Carousel opts={{ align: 'start', loop: false }} className="w-full" setApi={setApi}>
        <CarouselContent className={count <= 1 ? 'justify-center' : undefined}>
          {properties.map((p: any) => (
            <CarouselItem
              key={p.id}
              className="basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <a
                href="#"
                aria-label={p.name}
                className="group block h-full rounded-xl border bg-card shadow-sm hover:shadow transition focus-visible:outline-2 focus-visible:outline-primary"
              >
                <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                  />
                  {p.rating ? (
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-xs font-medium shadow">
                      <Lucide.Star className="size-3 text-accent" />
                      {p.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.25rem]">
                    {p.name}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {p.area}
                    {p.city ? ` · ${p.city}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.badges?.slice(0, 3).map((b: string) => (
                      <span
                        key={b}
                        className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] leading-none"
                      >
                        {b}
                      </span>
                    ))}
                    {p.badges && p.badges.length > 3 ? (
                      <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] leading-none">
                        +{p.badges.length - 3}
                      </span>
                    ) : null}
                  </div>
                  {p.priceFrom ? (
                    <p className="mt-2 text-xs">
                      From <span className="font-semibold">₹{p.priceFrom.toLocaleString()}</span>/mo
                    </p>
                  ) : null}
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Unified controls & indicators (desktop + mobile) */}
        {count > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous properties"
                onClick={() => api?.scrollTo(Math.max(current - 1, 0))}
                disabled={!canPrev}
                className="size-9 inline-flex items-center justify-center rounded-md border bg-background disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/20"
              >
                <Lucide.ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Next properties"
                onClick={() => api?.scrollTo(Math.min(current + 1, count - 1))}
                disabled={!canNext}
                className="size-9 inline-flex items-center justify-center rounded-md border bg-background disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/20"
              >
                <Lucide.ChevronRight className="size-5" />
              </button>
            </div>
            <div className="flex gap-1" aria-label="Carousel progress" role="tablist">
              {Array.from({ length: count }).map((_, i) => {
                const activeDot = i === current
                return (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-selected={activeDot}
                    role="tab"
                    onClick={() => api?.scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-primary ${activeDot ? 'w-5 bg-primary' : 'w-2 bg-muted hover:bg-muted/70'}`}
                  />
                )
              })}
            </div>
          </div>
        )}
      </Carousel>
    </section>
  )
}

export default PropertyCarousel
