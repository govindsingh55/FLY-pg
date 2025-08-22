import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { paymentId } = await req.json()
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    await (payload as any).update({
      collection: 'payments',
      id: paymentId,
      data: { status: 'failed' },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
