'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Filters, { FilterBadges } from '@/components/marketing/Filters'
import FiltersTrigger from './FiltersTrigger'
import { Property } from '@/payload/payload-types'
import { Media } from '@/components/Media'
import Link from 'next/link'

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
  preserve,
}: {
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
  totalPages: number
  preserve: URLSearchParams
}) {
  const prevParams = new URLSearchParams(preserve)
  prevParams.set('page', String(Math.max(1, page - 1)))
  const nextParams = new URLSearchParams(preserve)
  nextParams.set('page', String(page + 1))

  return (
    <div className="mt-8 flex items-center justify-between">
      <Link
        aria-disabled={!hasPrevPage}
        className={`text-sm underline-offset-4 hover:underline ${!hasPrevPage ? 'pointer-events-none opacity-50' : ''}`}
        href={`/properties?${prevParams.toString()}`}
      >
        ← Prev
      </Link>
      <span className="text-sm text-muted-foreground">
        Page {page} of {Math.max(1, totalPages)}
      </span>
      <Link
        aria-disabled={!hasNextPage}
        className={`text-sm underline-offset-4 hover:underline ${!hasNextPage ? 'pointer-events-none opacity-50' : ''}`}
        href={`/properties?${nextParams.toString()}`}
      >
        Next →
      </Link>
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

  // Build params from searchParams
  const params = useMemo(() => {
    const obj: any = {}
    for (const [key, value] of searchParams.entries()) {
      obj[key] = value
    }
    return obj
  }, [searchParams])

  // Build preserved params for pagination
  const preserved = useMemo(() => {
    const preserved = new URLSearchParams()
    if (params.q) preserved.set('q', params.q)
    if (params.city) preserved.set('city', params.city)
    if (params.type) preserved.set('type', params.type)
    if (params.sharing) preserved.set('sharing', params.sharing)
    if (params.minPrice) preserved.set('minPrice', params.minPrice)
    if (params.maxPrice) preserved.set('maxPrice', params.maxPrice)
    if (params.roomType) preserved.set('roomType', params.roomType)
    if (params.amenities) preserved.set('amenities', params.amenities)
    if (params.sort) preserved.set('sort', params.sort)
    return preserved
  }, [params])

  // Refetch when params change
  useEffect(() => {
    // Only refetch if params differ from initialParams
    const isInitial = JSON.stringify(params) === JSON.stringify(initialParams)
    if (isInitial) return
    setLoading(true)
    fetch('/api/properties?' + new URLSearchParams(params).toString())
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false))
  }, [params, initialParams])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold">Browse Properties</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="">
          <FilterBadges className="mt-2" />
        </div>
        <FiltersTrigger />
      </div>
      <section className="mt-2">
        {loading ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Loading…
          </div>
        ) : data.docs.length === 0 ? (
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
              preserve={preserved}
            />
          </>
        )}
      </section>
    </div>
  )
}
