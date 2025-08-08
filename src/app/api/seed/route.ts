import { seed } from '@/endpoints/seed/index'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    await seed({ payload, req: {} as any })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error during seeding from API:', error)
    return NextResponse.json(
      { success: false, error: String((error as Error)?.message || error) },
      { status: 500 },
    )
  }
}
