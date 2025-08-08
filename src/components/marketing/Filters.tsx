'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
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
import { parseAsString, parseAsStringEnum, parseAsInteger, useQueryStates } from 'nuqs'

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

type TypeValue = 'pg' | 'hostel' | 'apartment'
type SharingValue = 'single' | 'two' | 'three'
type SortValue = 'newest' | 'price_asc' | 'price_desc'

// nuqs parsers using v2 API: use withDefault(undefined) for optional params
// and serialize to null to drop keys from the URL when empty.
const parsers = {
  q: parseAsString.withDefault(''),
  city: parseAsString.withDefault(''),
  type: parseAsStringEnum<TypeValue>(['pg', 'hostel', 'apartment']).withDefault('apartment'),
  sharing: parseAsStringEnum<SharingValue>(['single', 'two', 'three']).withDefault('single'),
  minPrice: parseAsInteger.withDefault(0),
  maxPrice: parseAsInteger.withDefault(0),
  roomType: parseAsString.withDefault(''),
  amenities: parseAsString.withDefault(''),
  sort: parseAsStringEnum<SortValue>(['newest', 'price_asc', 'price_desc']).withDefault('newest'),
  page: parseAsInteger.withDefault(1),
} as const

function useNuqsFilters() {
  // history replace + shallow routing
  const [values, setValues] = useQueryStates(parsers, { history: 'replace', shallow: true })
  const pathname = usePathname()

  // helpers to set fields; setting empty/invalid clears param (null)
  function setParams(
    next: Partial<Record<keyof typeof parsers, string | number | null | undefined>>,
  ) {
    const patch: any = {}

    for (const [k, vRaw] of Object.entries(next)) {
      const key = k as keyof typeof parsers
      let v: any = vRaw
      if (typeof v === 'string') {
        const trimmed = v.trim()
        v = trimmed.length ? trimmed : null
      }
      if (key === 'minPrice' || key === 'maxPrice' || key === 'page') {
        if (typeof v === 'string') {
          const n = Number.parseInt(v, 10)
          v = Number.isFinite(n) ? n : null
        }
        if (typeof v === 'number' && !Number.isFinite(v)) v = null
      }
      patch[key] = v === undefined ? null : v
    }

    // page reset to 1 on any filter update except when explicitly provided
    if (!('page' in next)) {
      patch.page = 1
    }
    // ensure default sort when explicitly unset
    if ('sort' in next && (next as any).sort == null) {
      patch.sort = 'newest'
    }

    setValues(patch)
  }

  function clearAll() {
    setValues({
      q: null,
      city: null,
      type: null,
      sharing: null,
      minPrice: null,
      maxPrice: null,
      roomType: null,
      amenities: null,
      sort: 'newest',
      page: 1,
    })
  }

  const current = useMemo(() => {
    // For UI, keep empty strings compatible with existing defaults
    return {
      city: values.city ?? '',
      type: (values.type as TypeValue | null) ?? null,
      sharing: (values.sharing as SharingValue | null) ?? null,
      q: values.q ?? '',
      minPrice: values.minPrice && values.minPrice !== 0 ? String(values.minPrice) : '',
      maxPrice: values.maxPrice && values.maxPrice !== 0 ? String(values.maxPrice) : '',
      roomType: values.roomType ?? '',
      amenities: values.amenities ?? '',
      sort: (values.sort as SortValue) ?? 'newest',
      page: values.page ?? 1,
      pathname,
    }
  }, [values, pathname])

  return { current, setParams, clearAll }
}

export function FilterBadges({ className }: { className?: string }) {
  const { current, clearAll } = useNuqsFilters()
  const chips = [
    current.city && { label: current.city, key: 'city' },
    current.type && { label: String(current.type).toUpperCase(), key: 'type' },
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
    type: TypeValue | null
    sharing: SharingValue | null
    q: string
    minPrice: string
    maxPrice: string
    roomType: string
    amenities: string
    sort: SortValue
  }
  setParams: (next: Partial<Record<string, string | number | null | undefined>>) => void
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
            // Clear all by setting to null, keep sort 'newest' and page 1
            setParams({
              q: null,
              city: null,
              type: null,
              sharing: null,
              minPrice: null,
              maxPrice: null,
              roomType: null,
              amenities: null,
              sort: 'newest',
              page: 1,
            })
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
  const { current, setParams } = useNuqsFilters()

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
