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
