import { seed } from '@/endpoints/seed/index'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

interface SeedRequest {
  collections?: string[]
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Parse request body to get collection selection
    let selectedCollections: string[] | undefined
    try {
      const body: SeedRequest = await req.json()
      selectedCollections = body.collections
    } catch (parseError) {
      // If no body or invalid JSON, seed all collections (backward compatibility)
      selectedCollections = undefined
    }

    await seed({ payload, req: {} as any, selectedCollections })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error during seeding from API:', error)
    return NextResponse.json(
      { success: false, error: String((error as Error)?.message || error) },
      { status: 500 },
    )
  }
}
