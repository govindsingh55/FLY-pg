import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

type SearchParams = {
  q?: string
  city?: string
  minPrice?: string
  maxPrice?: string
  roomType?: string
  type?: string
  amenities?: string
  sort?: 'price_asc' | 'price_desc' | 'newest'
  page?: string | number
}

function normalizeParams(params: SearchParams) {
  const pageNum = typeof params.page === 'string' ? parseInt(params.page, 10) : Number(params.page)
  const page = Math.max(1, pageNum || 1)
  const limit = 12
  const sort = (params.sort ?? 'newest') as 'price_asc' | 'price_desc' | 'newest'
  const propertyType = params.type ? params.type.trim() : undefined
  return { ...params, page, limit, sort, propertyType }
}

function mapSort(sort: 'price_asc' | 'price_desc' | 'newest') {
  if (sort === 'price_asc') return 'roomRentPriceRange.min'
  if (sort === 'price_desc') return '-roomRentPriceRange.min'
  return '-createdAt'
}

async function buildQuery(p: ReturnType<typeof normalizeParams>, payload: any) {
  const and: any[] = [{ _status: { equals: 'published' } }]

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
    const roomsResult = await payload.find({
      collection: 'rooms',
      where: { roomType: { equals: p.roomType.trim() } },
      limit: 1000,
    })
    const ids = roomsResult.docs.map((r: any) => r.id)
    and.push({ rooms: { in: ids.length ? ids : ['__no_match__'] } })
  }

  if (p.propertyType && p.propertyType.trim()) {
    // propertyType is a select, prefer equals
    and.push({ propertyType: { equals: p.propertyType.trim() } })
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

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config })
    const raw = await req.json().catch(() => ({}))
    const normalized = normalizeParams(raw || {})
    const query = await buildQuery(normalized, payload)
    const data = await payload.find({
      collection: 'properties',
      where: query.where,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
      depth: 2,
    })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config })
    const url = new URL(req.url)
    const sp = url.searchParams
    const raw: SearchParams = {
      q: sp.get('q') || undefined,
      city: sp.get('city') || undefined,
      minPrice: sp.get('minPrice') || undefined,
      maxPrice: sp.get('maxPrice') || undefined,
      roomType: sp.get('roomType') || undefined,
      type: sp.get('type') || undefined,
      amenities: sp.get('amenities') || undefined,
      sort: (sp.get('sort') as any) || undefined,
      page: sp.get('page') || undefined,
    }
    const normalized = normalizeParams(raw)
    const query = await buildQuery(normalized, payload)
    const data = await payload.find({
      collection: 'properties',
      where: query.where,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
      depth: 2,
    })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
