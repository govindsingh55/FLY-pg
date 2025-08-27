import type { Metadata } from 'next'

// Ensure dynamic rendering; prevents build from needing DB access
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
import PropertiesListClient from './PropertiesListClient'

type SearchParams = {
  q?: string
  city?: string
  minPrice?: string
  maxPrice?: string
  roomType?: string
  type?: string
  amenities?: string
  sort?: 'price_asc' | 'price_desc' | 'newest'
  page?: string
}

export const metadata: Metadata = {
  title: 'Properties | Brand',
  description: 'Browse properties with filters',
}

function normalizeParams(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const limit = 12
  const sort = (params.sort ?? 'newest') as 'price_asc' | 'price_desc' | 'newest'
  const propertyType = params.type ? params.type.trim() : undefined
  return { ...params, page, limit, sort, propertyType }
}

function mapSort(sort: 'price_asc' | 'price_desc' | 'newest') {
  // Using roomRentPriceRange.min as price surrogate
  if (sort === 'price_asc') return 'roomRentPriceRange.min'
  if (sort === 'price_desc') return '-roomRentPriceRange.min'
  return '-createdAt'
}

async function fetchProperties(params: SearchParams) {
  const normalized = normalizeParams(params)
  // Call internal API route to centralize filtering logic
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/custom/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized),
    // Ensure this runs on the server without caching stale data
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch properties')
  return res.json()
}

async function buildPostBody(p: ReturnType<typeof normalizeParams>, payload: any) {
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

  // Two-step query for roomType
  if (p.roomType && p.roomType.trim()) {
    const roomsResult = await payload.find({
      collection: 'rooms',
      where: { roomType: { equals: p.roomType.trim() } },
      limit: 1000,
    })
    const matchingRoomIds = roomsResult.docs.map((room: any) => room.id)
    if (matchingRoomIds.length > 0) {
      console.log(
        `Found ${matchingRoomIds.length} rooms with type ${p.roomType} : `,
        JSON.stringify(matchingRoomIds),
      )
      and.push({ rooms: { in: matchingRoomIds } })
    }
  }

  if (p.propertyType && p.propertyType.trim()) {
    and.push({ propertyType: { like: p.propertyType.trim(), options: 'i' } })
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

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const searchParamsData = searchParams ? await searchParams : ({} as SearchParams)
  const data = await fetchProperties(searchParamsData)
  return <PropertiesListClient initialData={data} initialParams={searchParamsData} />
}
