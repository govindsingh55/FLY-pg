'use client'

import { useFilterActions } from '@/components/marketing/FilterContext'
import { FilterBadges } from '@/components/marketing/Filters'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Property } from '@/payload/payload-types'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import FiltersTrigger from './FiltersTrigger'
import { ArrowLeft, ArrowRight } from 'lucide-react'

function PropertyCard({ property }: { property: Property }) {
  const cover = property.images?.find((i) => i?.isCover) ?? property.images?.[0]
  const imgUrl = typeof cover?.image === 'object' && cover?.image?.url ? cover.image.url : undefined
  const city = property.address?.location?.city
  const priceMin = property.roomRentPriceRange?.min
  const roomTypeLabel = property.propertyType
  const amenities = property.amenities ?? []
  return (
    <Link href={`/properties/${property.slug}`} className="group">
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="relative aspect-[4/3] bg-muted">
          {imgUrl ? (
            <Media
              className="absolute inset-0 h-full w-full object-cover"
              resource={cover?.image}
              fill
              priority={true}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>
        <div className="space-y-1 p-4">
          <h3 className="font-semibold leading-snug">{property.name}</h3>
          <p className="text-sm text-muted-foreground">{city}</p>
          <p className="text-sm">
            {priceMin != null ? <>&#8377;{priceMin}/mo</> : '—'} · {roomTypeLabel}
          </p>
          {amenities.length ? (
            <p className="text-xs text-muted-foreground truncate">
              {amenities.slice(0, 5).join(', ')}
              {amenities.length > 5 ? '…' : ''}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

function Pagination({
  page,
  hasPrevPage,
  hasNextPage,
  totalPages,
}: {
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
  totalPages: number
}) {
  const { setParams } = useFilterActions()
  return (
    <div className="mt-8 flex items-center justify-between">
      <Button
        variant="outline"
        className={`text-primary ${!hasPrevPage ? 'pointer-events-none opacity-50' : ''}`}
        onClick={() => hasPrevPage && setParams({ page: Math.max(1, page - 1) })}
        aria-disabled={!hasPrevPage}
      >
        <span className="sr-only">Previous</span>
        <span>
          <ArrowLeft className="size-5" />
        </span>
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {Math.max(1, totalPages)}
      </span>
      <Button
        variant="outline"
        className={`text-primary ${!hasNextPage ? 'pointer-events-none opacity-50' : ''}`}
        onClick={() => hasNextPage && setParams({ page: page + 1 })}
        aria-disabled={!hasNextPage}
      >
        <span className="sr-only">Next</span>
        <span>
          <ArrowRight className="size-5" />
        </span>
      </Button>
    </div>
  )
}

export default function PropertiesListClient({
  initialData,
  initialParams,
}: {
  initialData: any
  initialParams: any
}) {
  const searchParams = useSearchParams()
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)

  // Build params from searchParams (URL is the source of truth for fetching)
  const params = useMemo(() => {
    const obj: any = {}
    for (const [key, value] of searchParams.entries()) {
      obj[key] = value
    }
    return obj
  }, [searchParams])

  // Refetch when params change
  useEffect(() => {
    // Only refetch if params differ from initialParams
    const isInitial = JSON.stringify(params) === JSON.stringify(initialParams)
    if (isInitial) return
    setLoading(true)

    let cancelled = false

    ;(async () => {
      const body: any = {}
      for (const k in params) body[k] = (params as any)[k]
      body.page = Number(params.page) || 1

      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/custom/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!cancelled) setData(json)
      if (!cancelled) setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [params, initialParams])

  return (
    <div className="mx-auto max-w-6xl w-full px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold">Browse Properties</h1>
      <div className="flex justify-between items-start mb-6 mt-2">
        <div className="">
          <FilterBadges className="" />
        </div>
        <FiltersTrigger />
      </div>
      <section className="mt-2">
        {loading ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Loading…
          </div>
        ) : data?.docs?.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            No properties found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.docs.map((p: Property) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
            <Pagination
              page={data.page}
              hasPrevPage={data.hasPrevPage}
              hasNextPage={data.hasNextPage}
              totalPages={data.totalPages}
            />
          </>
        )}
      </section>
    </div>
  )
}
