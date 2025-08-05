'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
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

/**
 * Unified Filters Component
 * - Responsive: Drawer on mobile (bottom), Sheet on desktop (left)
 * - URL params (superset): q, city, minPrice, maxPrice, roomType, amenities, sort, type, sharing
 * - Maintains existing "open-filters" global event
 * - Shows selected chips and provides Clear all
 *
 * NOTE: This only updates URL params and shows selected chips.
 *       It does NOT filter the data; server/pages should read params.
 */

type TypeValue = 'pg' | 'hostel' | 'apartment' | ''
type SharingValue = 'single' | 'two' | 'three' | ''
type SortValue = 'newest' | 'price_asc' | 'price_desc'

function useQueryState() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const current = useMemo(() => {
    const get = (k: string) => searchParams.get(k) ?? ''
    const city = get('city')
    const type = (get('type') as TypeValue) || ''
    const sharing = (get('sharing') as SharingValue) || ''
    const q = get('q')
    const minPrice = get('minPrice')
    const maxPrice = get('maxPrice')
    const roomType = get('roomType')
    const amenities = get('amenities')
    const sort = (searchParams.get('sort') as SortValue) || 'newest'
    return { city, type, sharing, q, minPrice, maxPrice, roomType, amenities, sort }
  }, [searchParams])

  function setParams(next: Partial<Record<string, string>>) {
    const sp = new URLSearchParams(Array.from(searchParams.entries()))
    for (const [k, v] of Object.entries(next)) {
      const val = v ?? ''
      if (val.trim()) sp.set(k, val.trim())
      else sp.delete(k)
    }
    // Keep page reset consistent
    sp.set('page', '1')
    // Default sort if missing
    if (!sp.get('sort')) sp.set('sort', 'newest')
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
  }

  function clearAll() {
    const keys = [
      'city',
      'type',
      'sharing',
      'q',
      'minPrice',
      'maxPrice',
      'roomType',
      'amenities',
      'sort',
    ]
    const sp = new URLSearchParams(Array.from(searchParams.entries()))
    keys.forEach((k) => sp.delete(k))
    // leave page reset and default sort
    sp.set('page', '1')
    sp.set('sort', 'newest')
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
  }

  return { current, setParams, clearAll }
}

export function FilterBadges({ className }: { className?: string }) {
  const { current, clearAll } = useQueryState()
  const chips = [
    current.city && { label: current.city, key: 'city' },
    current.type && { label: current.type.toUpperCase(), key: 'type' },
    current.sharing &&
      ({
        label: `${current.sharing} sharing`
          .replace('single', 'Single')
          .replace('two', 'Two')
          .replace('three', 'Three'),
        key: 'sharing',
      } as { label: string; key: string }),
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

function FiltersPanel({
  current,
  setParams,
  isPGorHostel,
  onClose,
}: {
  current: {
    city: string
    type: TypeValue
    sharing: SharingValue
    q: string
    minPrice: string
    maxPrice: string
    roomType: string
    amenities: string
    sort: SortValue
  }
  setParams: (next: Partial<Record<string, string>>) => void
  isPGorHostel: boolean
  onClose: () => void
}) {
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
            defaultValue={current.q}
            onChange={(e) => setParams({ q: e.target.value })}
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
            defaultValue={current.city}
            onChange={(e) => setParams({ city: e.target.value })}
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
                setParams({
                  type: t,
                  // if apartment, blank sharing
                  sharing: t === 'apartment' ? '' : current.sharing,
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
                onClick={() => setParams({ sharing: s })}
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
            defaultValue={current.minPrice}
            onChange={(e) => setParams({ minPrice: e.target.value })}
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Max Price</label>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 15000"
            defaultValue={current.maxPrice}
            onChange={(e) => setParams({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      {/* Room Type (kept distinct from type/sharing as per decision) */}
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">Room Type</label>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          defaultValue={current.roomType}
          onChange={(e) => setParams({ roomType: e.target.value })}
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
          defaultValue={current.amenities}
          onChange={(e) => setParams({ amenities: e.target.value })}
        />
      </div>

      {/* Sort */}
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">Sort</label>
        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          defaultValue={current.sort}
          onChange={(e) => {
            const v = (e.target.value as SortValue) || 'newest'
            setParams({ sort: v })
          }}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Footer actions */}
      <div className="mt-2 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            // Clear all but leave default sort and page
            const empty: Partial<Record<string, string>> = {
              city: '',
              type: '',
              sharing: '',
              q: '',
              minPrice: '',
              maxPrice: '',
              roomType: '',
              amenities: '',
              sort: 'newest',
            }
            setParams(empty as Record<string, string>)
          }}
        >
          Reset
        </Button>
        <Button onClick={onClose}>Apply</Button>
      </div>
    </div>
  )
}

export default function Filters() {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const { current, setParams } = useQueryState()

  // Track screen size and ensure only one primitive can render
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  const isPGorHostel = current.type === 'pg' || current.type === 'hostel'

  // Global open event
  useEffect(() => {
    const openHandler = () => setOpen(true)
    document.addEventListener('open-filters', openHandler as EventListener)
    return () => document.removeEventListener('open-filters', openHandler as EventListener)
  }, [])

  return (
    <>
      {/* Responsive container: Drawer on mobile, Sheet on desktop (left) */}
      {!isDesktop ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="data-[vaul-drawer-direction=bottom]:rounded-t-2xl">
            <DrawerHeader className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Lucide.Funnel className="size-4" />
                <DrawerTitle className="text-sm font-medium">Filters</DrawerTitle>
              </div>
            </DrawerHeader>
            <FiltersPanel
              current={current as any}
              setParams={setParams}
              isPGorHostel={isPGorHostel}
              onClose={() => setOpen(false)}
            />
            <DrawerFooter />
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left">
            <SheetHeader className="flex items-center justify-between border-b px-4 py-4">
              <div className="flex items-center gap-2">
                <Lucide.Funnel className="size-4" />
                <SheetTitle className="text-sm font-medium">Filters</SheetTitle>
              </div>
            </SheetHeader>
            <FiltersPanel
              current={current as any}
              setParams={setParams}
              isPGorHostel={isPGorHostel}
              onClose={() => setOpen(false)}
            />
            <SheetFooter />
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
