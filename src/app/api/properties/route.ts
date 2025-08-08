import { getPayload } from 'payload'
import config from '@payload-config'

type AllParams = {
  q?: string
  city?: string
  minPrice?: string
  maxPrice?: string
  roomType?: string
  amenities?: string
  sort?: 'price_asc' | 'price_desc' | 'newest'
  page?: string
  [key: string]: any
}

function normalizeParams(
  params: AllParams,
): AllParams & { page: number; limit: number; sort: 'price_asc' | 'price_desc' | 'newest' } {
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const limit = 12
  const sort = (params.sort ?? 'newest') as 'price_asc' | 'price_desc' | 'newest'
  return { ...params, page, limit, sort } as AllParams & {
    page: number
    limit: number
    sort: 'price_asc' | 'price_desc' | 'newest'
  }
}

function mapSort(sort: 'price_asc' | 'price_desc' | 'newest') {
  if (sort === 'price_asc') return 'roomRentPriceRange.min'
  if (sort === 'price_desc') return '-roomRentPriceRange.min'
  return '-createdAt'
}

async function buildPostBody(p: ReturnType<typeof normalizeParams>) {
  const and: any[] = []
  if (p.q && p.q.trim()) {
    const q = p.q.trim()
    and.push({ or: [{ name: { like: q } }, { description: { like: q } }] })
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
  // Two-step query for roomType: fetch matching room IDs, then filter properties by those IDs
  if (p.roomType && p.roomType.trim() && p._payload) {
    const roomsResult = await p._payload.find({
      collection: 'rooms',
      where: { roomType: { equals: p.roomType.trim() } },
      limit: 1000,
    })
    const matchingRoomIds = roomsResult.docs.map((room: any) => room.id)
    if (matchingRoomIds.length > 0) {
      and.push({ rooms: { in: matchingRoomIds } })
    }
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

export async function GET(request: Request) {
  const url = new URL(request.url)
  const params: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    params[key] = value
  })
  const normalized = normalizeParams(params)
  const payload = await getPayload({ config })
  // Pass payload instance to buildPostBody for roomType filtering
  const query = await buildPostBody({ ...normalized, _payload: payload })
  const data = await payload.find({
    collection: 'properties',
    where: query.where,
    sort: query.sort,
    page: query.page,
    limit: query.limit,
  })
  console.log('Query:', query)
  console.log('Data:', data)
  return Response.json(data)
}
