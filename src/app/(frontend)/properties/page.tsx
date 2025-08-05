import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/payload/payload-types'

type SearchParams = {
  q?: string
  city?: string
  minPrice?: string
  maxPrice?: string
  roomType?: string
  amenities?: string
  sort?: 'price_asc' | 'price_desc' | 'newest'
  page?: string
}

type PayloadListResponse = {
  docs: Property[]
  totalDocs: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const metadata: Metadata = {
  title: 'Properties | Brand',
  description: 'Browse properties with filters',
}

function normalizeParams(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const limit = 12
  const sort = (params.sort ?? 'newest') as 'price_asc' | 'price_desc' | 'newest'
  return { ...params, page, limit, sort }
}

function mapSort(sort: 'price_asc' | 'price_desc' | 'newest') {
  // Using roomRentPriceRange.min as price surrogate
  if (sort === 'price_asc') return 'roomRentPriceRange.min'
  if (sort === 'price_desc') return '-roomRentPriceRange.min'
  return '-createdAt'
}

function buildGetURL(base: string, p: ReturnType<typeof normalizeParams>) {
  const sp = new URLSearchParams()
  sp.set('limit', String(p.limit))
  sp.set('page', String(p.page))
  sp.set('sort', mapSort(p.sort))

  let andIndex = 0

  // q => OR group on name/description
  if (p.q && p.q.trim()) {
    const q = p.q.trim()
    sp.set(`where[and][${andIndex}][or][0][name][like]`, q)
    sp.set(`where[and][${andIndex}][or][1][description][like]`, q)
    andIndex += 1
  }

  if (p.city && p.city.trim()) {
    sp.set(`where[and][${andIndex}][address][location][city][equals]`, p.city.trim())
    andIndex += 1
  }

  if (p.minPrice && !Number.isNaN(Number(p.minPrice))) {
    sp.set(
      `where[and][${andIndex}][roomRentPriceRange][min][greater_than_equal]`,
      String(p.minPrice),
    )
    andIndex += 1
  }

  if (p.maxPrice && !Number.isNaN(Number(p.maxPrice))) {
    sp.set(`where[and][${andIndex}][roomRentPriceRange][max][less_than_equal]`, String(p.maxPrice))
    andIndex += 1
  }

  if (p.roomType && p.roomType.trim()) {
    // rooms.roomType equals
    sp.set(`where[and][${andIndex}][rooms][relationTo][equals]`, 'rooms')
    sp.set(`where[and][${andIndex}][rooms][value][some][roomType][equals]`, p.roomType.trim())
    andIndex += 1
  }

  if (p.amenities && p.amenities.trim()) {
    const items = p.amenities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const a of items) {
      sp.set(`where[and][${andIndex}][amenities][contains]`, a)
      andIndex += 1
    }
  }

  return `${base}?${sp.toString()}`
}

async function fetchProperties(params: SearchParams): Promise<PayloadListResponse> {
  const normalized = normalizeParams(params)
  // Primary: GET
  const url = buildGetURL(`${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/api/properties`, normalized)
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`GET failed: ${res.status}`)
    const data = await res.json()
    return adaptPayloadList(data)
  } catch {
    // Fallback: POST with body where
    const body = buildPostBody(normalized)
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/api/properties`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`POST failed: ${res.status}`)
    const data = await res.json()
    return adaptPayloadList(data)
  }
}

function buildPostBody(p: ReturnType<typeof normalizeParams>) {
  const and: any[] = []

  if (p.q && p.q.trim()) {
    const q = p.q.trim()
    and.push({
      or: [{ name: { like: q } }, { description: { like: q } }],
    })
  }

  if (p.city && p.city.trim()) {
    and.push({ address: { location: { city: { equals: p.city.trim() } } } })
  }

  if (p.minPrice) {
    and.push({ roomRentPriceRange: { min: { greater_than_equal: Number(p.minPrice) } } })
  }

  if (p.maxPrice) {
    and.push({ roomRentPriceRange: { max: { less_than_equal: Number(p.maxPrice) } } })
  }

  if (p.roomType && p.roomType.trim()) {
    and.push({
      rooms: {
        value: {
          some: {
            roomType: { equals: p.roomType.trim() },
          },
        },
      },
    })
  }

  if (p.amenities && p.amenities.trim()) {
    const items = p.amenities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const a of items) {
      and.push({ amenities: { contains: a } })
    }
  }

  return {
    where: { and },
    sort: mapSort(p.sort),
    page: p.page,
    limit: p.limit,
  }
}

function adaptPayloadList(data: any): PayloadListResponse {
  return {
    docs: (data.docs ?? []) as Property[],
    totalDocs: Number(data.totalDocs ?? data.total ?? 0),
    page: Number(data.page ?? data.pageIndex ?? 1),
    totalPages: Number(data.totalPages ?? data.totalPages ?? 1),
    hasNextPage: Boolean(data.hasNextPage ?? data.page < data.totalPages),
    hasPrevPage: Boolean(data.hasPrevPage ?? data.page > 1),
  }
}

function PropertyCard({ property }: { property: Property }) {
  const cover = property.images?.find((i) => i?.isCover) ?? property.images?.[0]
  const img = typeof cover?.image === 'object' && cover?.image?.url ? cover.image.url : undefined
  const city = property.address?.location?.city
  const priceMin = property.roomRentPriceRange?.min
  const roomTypeLabel = property.propertyType
  const amenities = property.amenities ?? []

  return (
    <Link href={`/properties/${property.id}`} className="group">
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="relative aspect-[4/3] bg-muted">
          {img ? (
            <Image
              src={img}
              alt={property.name}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : null}
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

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const searchParamsData = await searchParams
  const data = await fetchProperties(searchParamsData)
  const normalized = normalizeParams(searchParamsData)

  const preserved = new URLSearchParams()
  if (searchParamsData.q) preserved.set('q', searchParamsData.q)
  if (searchParamsData.city) preserved.set('city', searchParamsData.city)
  if (searchParamsData.minPrice) preserved.set('minPrice', searchParamsData.minPrice)
  if (searchParamsData.maxPrice) preserved.set('maxPrice', searchParamsData.maxPrice)
  if (searchParamsData.roomType) preserved.set('roomType', searchParamsData.roomType)
  if (searchParamsData.amenities) preserved.set('amenities', searchParamsData.amenities)
  if (normalized.sort) preserved.set('sort', normalized.sort)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold">Browse Properties</h1>

      <section className="mt-6">
        {data.docs.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            No properties found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.docs.map((p) => (
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
