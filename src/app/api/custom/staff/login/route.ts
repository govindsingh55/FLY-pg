import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Authenticate the user
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    if (!result.user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = result.user as any

    // Verify the user is staff (not a customer or regular user)
    const allowedRoles = ['chef', 'cleaning', 'security', 'maintenance', 'manager', 'admin']
    if (!user.role || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ message: 'Unauthorized - Staff access only' }, { status: 403 })
    }

    // Create response with session cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    // Set session cookie
    if (result.token) {
      response.cookies.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Staff login error:', error)
    return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 })
  }
}
