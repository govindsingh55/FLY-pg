import { getPayload } from 'payload'
import config from '@payload-config'

export interface StaffSession {
  user: {
    id: string
    email: string
    name?: string
    role: 'admin' | 'manager' | 'chef' | 'cleaning' | 'security' | 'maintenance'
    collection: 'users'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

/**
 * Get staff user from session using cookies
 */
export async function getStaffFromSession(req: Request): Promise<StaffSession['user'] | null> {
  try {
    const payload = await getPayload({ config })

    // Extract cookies from request
    const cookies = req.headers.get('cookie')
    if (!cookies) return null

    // Use Payload's session validation
    const session = await payload.auth({
      headers: req.headers,
    })

    if (!session?.user || session.user.collection !== 'users') {
      return null
    }

    return {
      ...session.user,
      name: session.user.name || undefined,
      collection: 'users',
    } as StaffSession['user']
  } catch (error) {
    console.error('Error getting staff from session:', error)
    return null
  }
}

/**
 * Validate staff session and return user data
 */
export async function validateStaffSession(req: Request): Promise<{
  user: StaffSession['user'] | null
  error?: string
}> {
  try {
    const user = await getStaffFromSession(req)

    if (!user) {
      return {
        user: null,
        error: 'Unauthorized - No valid staff session',
      }
    }

    // Ensure user has a staff role
    const staffRoles = ['admin', 'manager', 'chef', 'cleaning', 'security', 'maintenance']
    if (!staffRoles.includes(user.role)) {
      return {
        user: null,
        error: 'Unauthorized - Not a staff member',
      }
    }

    return { user }
  } catch (error) {
    console.error('Session validation error:', error)
    return {
      user: null,
      error: 'Internal server error during session validation',
    }
  }
}

/**
 * Rate limiting helper (basic implementation)
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 200, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    if (record.count >= this.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - record.count)
  }
}

// Global rate limiter instance for staff
export const staffRateLimiter = new RateLimiter(200, 15 * 60 * 1000) // 200 requests per 15 minutes
