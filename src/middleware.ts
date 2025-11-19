import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /staff routes
  if (pathname.startsWith('/staff')) {
    // Exclude login page from protection
    if (pathname === '/staff/login') {
      return NextResponse.next()
    }

    // Check for payload-token cookie
    const token = request.cookies.get('payload-token')

    if (!token) {
      // Redirect to login if no token found
      const loginUrl = new URL('/staff/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/staff/:path*',
  ],
}
