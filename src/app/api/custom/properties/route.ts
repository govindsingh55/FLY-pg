import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const propertyIds = searchParams.get('ids')?.split(',') || []
    const showAll = searchParams.get('showAll') !== 'false'

    const payload = await getPayload({ config })

    const whereClause: any = {
      status: { equals: 'active' },
      ...(!showAll && propertyIds.length > 0 && { id: { in: propertyIds } }),
    }

    const result = await payload.find({
      collection: 'properties',
      where: whereClause,
      limit,
      depth: 2,
    })

    const processedProperties = result.docs.map((prop: any) => ({
      id: prop.id,
      name: prop.name,
      slug: prop.slug,
      propertyType: prop.propertyType,
      genderType: prop.genderType,
      address: prop.address,
      images: prop.images,
      rooms: prop.rooms,
      amenities: prop.amenities,
    }))

    return NextResponse.json({
      success: true,
      properties: processedProperties,
      total: result.totalDocs,
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      q,
      city,
      minPrice,
      maxPrice,
      roomType,
      propertyType,
      amenities,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = body

    const payload = await getPayload({ config })

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const and: any[] = [{ _status: { equals: 'published' } }]

    if (q && q.trim()) {
      const query = q.trim()
      and.push({
        or: [{ name: { like: query } }, { description: { like: query } }],
      })
    }

    if (city && city.trim()) {
      and.push({ 'address.location.city': { equals: city.trim() } })
    }

    if (minPrice) {
      and.push({ 'roomRentPriceRange.min': { greater_than_equal: Number(minPrice) } })
    }

    if (maxPrice) {
      and.push({ 'roomRentPriceRange.max': { less_than_equal: Number(maxPrice) } })
    }

    if (roomType && roomType.trim()) {
      // Find rooms with the specified type
      const roomsResult = await payload.find({
        collection: 'rooms',
        where: { roomType: { equals: roomType.trim() } },
        limit: 1000,
      })
      const matchingRoomIds = roomsResult.docs.map((room: any) => room.id)
      if (matchingRoomIds.length > 0) {
        and.push({ rooms: { in: matchingRoomIds } })
      }
    }

    if (propertyType && propertyType.trim()) {
      and.push({ propertyType: { like: propertyType.trim(), options: 'i' } })
    }

    if (amenities && amenities.length > 0) {
      and.push({ amenities: { in: amenities } })
    }

    // Map sort parameter
    let sortField = '-createdAt' // default
    if (sort === 'price_asc') sortField = 'roomRentPriceRange.min'
    if (sort === 'price_desc') sortField = '-roomRentPriceRange.min'

    const result = await payload.find({
      collection: 'properties',
      where: { and },
      sort: sortField,
      page: Number(page),
      limit: Number(limit),
      depth: 2,
    })

    const processedProperties = result.docs.map((prop: any) => ({
      id: prop.id,
      name: prop.name,
      slug: prop.slug,
      propertyType: prop.propertyType,
      genderType: prop.genderType,
      address: prop.address,
      images: prop.images,
      rooms: prop.rooms,
      amenities: prop.amenities,
      roomRentPriceRange: prop.roomRentPriceRange,
      createdAt: prop.createdAt,
    }))

    return NextResponse.json({
      success: true,
      properties: processedProperties,
      total: result.totalDocs,
      page: result.page,
      totalPages: result.totalPages,
    })
  } catch (error) {
    console.error('Error fetching properties with filters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 },
    )
  }
}
