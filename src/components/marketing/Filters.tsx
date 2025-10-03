'use client'
import { useEffect, useState } from 'react'
import {
  useFilterState,
  useFilterActions,
  TypeValue,
  SharingValue,
  SortValue,
} from './FilterContext'
import * as Lucide from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { locations } from '@/data'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'

export function FilterBadges({ className }: { className?: string }) {
  const current = useFilterState()
  const { clearAll } = useFilterActions()
  const chips = [
    current.city && { label: current.city, key: 'city' },
    current.type && { label: String(current.type).toUpperCase(), key: 'type' },
    current.sharing && {
      label: `${current.sharing} sharing`
        .replace('single', 'Single')
        .replace('two', 'Two')
        .replace('three', 'Three'),
      key: 'sharing',
    },
    current.q && { label: `“${current.q}”`, key: 'q' },
    current.minPrice && { label: `Min ₹${current.minPrice}`, key: 'minPrice' },
    current.maxPrice && { label: `Max ₹${current.maxPrice}`, key: 'maxPrice' },
    current.roomType && { label: `Room: ${current.roomType}`, key: 'roomType' },
    current.amenities && { label: `Amenities: ${current.amenities}`, key: 'amenities' },
    current.sort && { label: `Sort: ${current.sort}`, key: 'sort' },
  ].filter(Boolean) as { label: string; key: string }[]
  if (chips.length === 0) return null
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-xs"
        >
          {c.label}
        </span>
      ))}
      <button
        onClick={clearAll}
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
      >
        Clear all
      </button>
    </div>
  )
}

function FiltersPanel({ onClose }: { onClose: () => void }) {
  const current = useFilterState()
  const { setFilters, setFilterApplied, clearAll } = useFilterActions()
  const isPGorHostel = current.type === 'pg' || current.type === 'hostel'
  return (
    <div className="grid gap-4 overflow-y-auto px-4 py-4">
      {/* Search */}
      <div>
        <label className="text-xs text-muted-foreground">Search</label>
        <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-2">
          <Lucide.Search className="size-4 text-muted-foreground" />
          <input
            className="h-10 w-full bg-transparent outline-none"
            placeholder="Search by name or description"
            value={current.q ?? undefined}
            onChange={(e) => setFilters({ q: e.target.value })}
          />
        </div>
      </div>

      {/* City with datalist */}
      <div>
        <label className="text-xs text-muted-foreground">City</label>
        <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-2">
          <Lucide.MapPin className="size-4 text-muted-foreground" />
          <input
            list="filter-cities"
            className="h-10 w-full bg-transparent outline-none"
            placeholder="Choose city"
            value={current.city ?? undefined}
            onChange={(e) => setFilters({ city: e.target.value })}
          />
          <datalist id="filter-cities">
            {locations.map((l) => (
              <option key={l.id} value={l.name} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="text-xs text-muted-foreground">Property Type</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(['pg', 'hostel', 'apartment'] as TypeValue[]).map((t) => (
            <button
              key={t}
              onClick={() =>
                setFilters({
                  type: t,
                  // if apartment, clear sharing in same batch
                  sharing: t === 'apartment' ? null : (current.sharing ?? null),
                })
              }
              className={cn(
                'rounded-md border px-3 py-2 text-sm capitalize hover:bg-muted',
                current.type === t && 'border-primary bg-primary/10',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Sharing (conditional for pg/hostel) */}
      {isPGorHostel && (
        <div>
          <label className="text-xs text-muted-foreground">Sharing</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(['single', 'two', 'three'] as SharingValue[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilters({ sharing: s })}
                className={cn(
                  'rounded-md border px-3 py-2 text-sm capitalize hover:bg-muted',
                  current.sharing === s && 'border-primary bg-primary/10',
                )}
              >
                {s === 'two' ? 'Two' : s === 'three' ? 'Three' : 'Single'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Min Price</label>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 4000"
            value={current.minPrice ?? undefined}
            onChange={(e) => setFilters({ minPrice: Number(e.target.value) })}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                const next = Number(current.minPrice ?? 0) + 1
                setFilters({ minPrice: next })
                e.preventDefault()
              } else if (e.key === 'ArrowDown') {
                const next = Math.max(0, Number(current.minPrice ?? 0) - 1)
                setFilters({ minPrice: next })
                e.preventDefault()
              }
            }}
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Max Price</label>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 15000"
            value={current.maxPrice ?? undefined}
            onChange={(e) => setFilters({ maxPrice: Number(e.target.value) })}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                const next = Number(current.maxPrice ?? 0) + 1
                setFilters({ maxPrice: next })
                e.preventDefault()
              } else if (e.key === 'ArrowDown') {
                const next = Math.max(0, Number(current.maxPrice ?? 0) - 1)
                setFilters({ maxPrice: next })
                e.preventDefault()
              }
            }}
          />
        </div>
      </div>

      {/* Room Type (kept distinct from type/sharing as per decision) */}
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">Room Type</label>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={current.roomType ?? undefined}
          onChange={(e) => setFilters({ roomType: e.target.value })}
        >
          <option value="">Any</option>
          <option value="single">Single</option>
          <option value="two_sharing">Two sharing</option>
          <option value="three_sharing">Three sharing</option>
        </select>
      </div>

      {/* Amenities */}
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">Amenities (comma separated)</label>
        <Input
          placeholder="wifi, parking"
          value={current.amenities ?? undefined}
          onChange={(e) => setFilters({ amenities: e.target.value })}
        />
      </div>

      {/* Sort */}
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">Sort</label>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={current.sort ?? undefined}
          onChange={(e) => {
            const v = (e.target.value as SortValue) || 'newest'
            setFilters({ sort: v })
          }}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Footer actions */}
      <div className="mt-2 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={clearAll}>
          Reset
        </Button>
        <Button onClick={() => setFilterApplied(true)}>Apply</Button>
      </div>
    </div>
  )
}

export default function Filters() {
  const current = useFilterState()
  const actions = useFilterActions()
  const [isDesktop, setIsDesktop] = useState(false)
  // ...existing code...

  // Track screen size and ensure only one primitive can render
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return (
    <>
      {/* Responsive container: Drawer on mobile, Sheet on desktop (left) */}
      {!isDesktop ? (
        <Drawer open={current.isFilterPanelOpen} onOpenChange={actions.toggleFilterPanel}>
          <DrawerContent className="data-[vaul-drawer-direction=bottom]:rounded-t-2xl">
            <DrawerHeader className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Lucide.Funnel className="size-4" />
                <DrawerTitle className="text-sm font-medium">Filters</DrawerTitle>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-scroll pb-10">
              <FiltersPanel onClose={() => actions.toggleFilterPanel(false)} />
            </div>
            <DrawerFooter />
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={current.isFilterPanelOpen} onOpenChange={actions.toggleFilterPanel}>
          <SheetContent side="right">
            <SheetHeader className="flex items-center justify-between border-b px-4 py-4">
              <div className="flex items-center gap-2">
                <Lucide.Funnel className="size-4" />
                <SheetTitle className="text-sm font-medium">Filters</SheetTitle>
              </div>
            </SheetHeader>
            <FiltersPanel onClose={() => actions.toggleFilterPanel(false)} />
            <SheetFooter />
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
