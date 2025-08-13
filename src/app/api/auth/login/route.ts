import { NextRequest, NextResponse } from 'next/server'
import { loginUser, AuthCollection } from '@/lib/auth/service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      email,
      password,
      collection = 'customers',
    } = body as {
      email?: string
      password?: string
      collection?: AuthCollection
    }
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    if (!['customers', 'users'].includes(collection)) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 })
    }
    const result = await loginUser({ collection, email, password })
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Login failed' }, { status: 401 })
    }
    // Cookies for auth are already set by payload.login (httpOnly JWT + refresh token) via local API
    return NextResponse.json({ success: true, user: result.user, collection })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
