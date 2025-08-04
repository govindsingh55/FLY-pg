import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

type SearchParams = {
  city?: string
  minPrice?: string
  maxPrice?: string
  page?: string
}

export const metadata: Metadata = {
  title: 'Search Properties',
}

const PAGE_SIZE = 12

export default async function SearchPage({ searchParams }: { searchParams?: SearchParams }) {
  const city = (searchParams?.city || '').trim()
  const minPrice = Number(searchParams?.minPrice ?? '')
  const maxPrice = Number(searchParams?.maxPrice ?? '')
  const page = Math.max(1, Number(searchParams?.page ?? 1))

  const where: any = {}

  if (city) {
    // Case-sensitive in Payload; can normalize data or implement ilike with custom query if needed
    where['address.location.city'] = { equals: city }
  }

  // Price range using precomputed group on Property
  const priceClauses: any[] = []
  if (!Number.isNaN(minPrice)) {
    // property qualifies if its max is at least the min filter
    priceClauses.push({ 'roomRentPriceRange.max': { gte: minPrice } })
  }
  if (!Number.isNaN(maxPrice) && maxPrice > 0) {
    // property qualifies if its min is at most the max filter
    priceClauses.push({ 'roomRentPriceRange.min': { lte: maxPrice } })
  }

  const payload = await getPayload({ config: configPromise })

  const finalWhere = priceClauses.length > 0 ? { and: [where, { and: priceClauses }] } : where

  const {
    docs,
    totalPages,
    page: currentPage,
  } = await payload.find({
    collection: 'properties',
    where: finalWhere,
    limit: PAGE_SIZE,
    page,
    draft: false,
    pagination: true,
    overrideAccess: false,
    select: {
      slug: true,
      name: true,
      'address.location.city': true,
      roomRentPriceRange: true,
      propertyType: true,
      genderType: true,
      images: true,
    },
  })

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-semibold mb-6">Search Properties</h1>

      {/* Minimal search form (GET) */}
      <form method="get" className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          name="city"
          placeholder="City"
          defaultValue={city}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Min price"
          defaultValue={Number.isNaN(minPrice) ? '' : String(minPrice)}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max price"
          defaultValue={Number.isNaN(maxPrice) ? '' : String(maxPrice)}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90"
        >
          Apply
        </button>
      </form>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((p: any) => {
          const range = p.roomRentPriceRange || {}
          const min = range.min
          const max = range.max

          let cover: any = undefined
          if (Array.isArray(p.images) && p.images.length > 0) {
            cover = p.images.find((img: any) => img?.isCover) || p.images[0]
          }

          return (
            <Link
              key={p.slug}
              href={`/properties/${p.slug}`}
              className="rounded-lg border hover:shadow-sm transition p-3 flex flex-col gap-2"
            >
              <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center text-xs text-muted-foreground">
                {cover ? 'Image' : 'No Image'}
              </div>
              <div className="text-base font-medium">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.address?.location?.city}</div>
              <div className="text-sm">
                {typeof min === 'number' && typeof max === 'number'
                  ? `₹ ${min.toLocaleString()} - ₹ ${max.toLocaleString()} / mo`
                  : 'Price on request'}
              </div>
              <div className="text-xs text-muted-foreground">
                {[p.propertyType, p.genderType].filter(Boolean).join(' • ')}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1
            const params = new URLSearchParams()
            if (city) params.set('city', city)
            if (!Number.isNaN(minPrice)) params.set('minPrice', String(minPrice))
            if (!Number.isNaN(maxPrice) && maxPrice > 0) params.set('maxPrice', String(maxPrice))
            params.set('page', String(pageNum))
            const href = `/search?${params.toString()}`
            const isActive = pageNum === currentPage
            return (
              <Link
                key={pageNum}
                href={href}
                className={`px-3 py-1.5 rounded-md border text-sm ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
                prefetch={false}
              >
                {pageNum}
              </Link>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {docs.length === 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          No properties match your filters.
        </div>
      )}
    </main>
  )
}
