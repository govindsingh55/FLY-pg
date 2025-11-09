import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' })

  response.cookies.delete('payload-token')

  return response
}
