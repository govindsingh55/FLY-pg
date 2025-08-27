import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest } from 'next/server'

export interface CustomerSession {
  user: {
    id: string
    email: string
    name?: string
    collection: 'customers'
    [key: string]: any
  }
}

/**
 * Authenticate customer from request (for API routes)
 */
export async function authenticateCustomer(req: NextRequest): Promise<CustomerSession['user'] | null> {
  try {
    const payload = await getPayload({ config })

    // Check for authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return null

    // Validate Bearer token format
    if (!authHeader.startsWith('Bearer ')) return null

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Use Payload's session validation
    const session = await payload.auth({
      headers: req.headers,
    })

    if (!session?.user || session.user.collection !== 'customers') {
      return null
    }

    return {
      ...session.user,
      collection: 'customers',
    }
  } catch (error) {
    console.error('Error authenticating customer:', error)
    return null
  }
}

/**
 * Get customer from session using cookies
 */
export async function getCustomerFromSession(
  req: Request,
): Promise<CustomerSession['user'] | null> {
  try {
    const payload = await getPayload({ config })

    // Extract cookies from request
    const cookies = req.headers.get('cookie')
    if (!cookies) return null

    // Use Payload's session validation
    const session = await payload.auth({
      headers: req.headers,
    })

    if (!session?.user || session.user.collection !== 'customers') {
      return null
    }

    return {
      ...session.user,
      collection: 'customers',
    }
  } catch (error) {
    console.error('Error getting customer from session:', error)
    return null
  }
}

/**
 * Validate customer session and return user data
 */
export async function validateCustomerSession(req: Request): Promise<{
  user: CustomerSession['user'] | null
  error?: string
}> {
  try {
    const user = await getCustomerFromSession(req)

    if (!user) {
      return {
        user: null,
        error: 'Unauthorized - No valid customer session',
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
 * Check if customer has access to a specific resource
 */
export function checkCustomerAccess(customerId: string, resourceCustomerId: string): boolean {
  return customerId === resourceCustomerId
}

/**
 * Rate limiting helper (basic implementation)
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
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

// Global rate limiter instance
export const customerRateLimiter = new RateLimiter(100, 15 * 60 * 1000) // 100 requests per 15 minutes
