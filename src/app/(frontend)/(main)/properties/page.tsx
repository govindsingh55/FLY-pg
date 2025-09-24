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

async function fetchProperties(params: SearchParams) {
  const normalized = normalizeParams(params)
  // Call internal API route to centralize filtering logic
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/custom/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized),
    // Ensure this runs on the server without caching stale data
    cache: 'no-store',
  })
  if (!res.ok) {
    const errorText = await res.text()
    console.error('Properties API error:', res.status, errorText)
    throw new Error(`Failed to fetch properties: ${res.status} ${errorText}`)
  }
  return res.json()
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  console.log('Rendering HomePage', process.env.NODE_ENV)

  const searchParamsData = searchParams ? await searchParams : ({} as SearchParams)
  const data = await fetchProperties(searchParamsData)
  return <PropertiesListClient initialData={data} initialParams={searchParamsData} />
}
