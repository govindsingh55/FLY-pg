'use client'

import { Input } from '@/components/ui/input'
import { useFilterActions } from './FilterContext'

export function HeroSearch() {
  const actions = useFilterActions()
  return (
    <section
      className="relative flex items-center justify-center px-4 py-24 md:py-32"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white">
          Your Stay. <span className="text-accent">Your Way.</span>
        </h1>
        <p className="mt-3 text-white/80">
          Discover curated coliving spaces in top cities. Flexible, furnished, and community-first.
        </p>
        <div className="mt-6 flex items-center justify-center">
          <div className="w-full max-w-xl">
            <Input
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                actions.toggleFilterPanel(true)
              }}
              placeholder="Search properties"
              className="bg-white/95 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-white/70">
          No brokerage, flexible move-ins, all-inclusive bills.
        </p>
      </div>
    </section>
  )
}

export default HeroSearch
