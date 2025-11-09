import { NextRequest, NextResponse } from 'next/server'
import { validateStaffSession } from '@/lib/auth/staff-auth'

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await validateStaffSession(req)

    if (error || !user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Staff me error:', err)
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 })
  }
}
