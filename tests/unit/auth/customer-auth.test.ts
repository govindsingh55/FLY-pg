import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the payload service
vi.mock('@/lib/auth/service', () => ({
  getPayload: vi.fn(),
}))

describe('Customer Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('authenticateCustomer', () => {
    it('should return null when no authorization header', async () => {
      const { authenticateCustomer } = await import('@/lib/auth/customer-auth')

      const request = new NextRequest('http://localhost:3000/api/test')
      const result = await authenticateCustomer(request)

      expect(result).toBeNull()
    }, 10000) // 10 second timeout

    it('should return null when invalid token format', async () => {
      const { authenticateCustomer } = await import('@/lib/auth/customer-auth')

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'InvalidToken',
        },
      })
      const result = await authenticateCustomer(request)

      expect(result).toBeNull()
    })

    it('should return null when token is missing Bearer prefix', async () => {
      const { authenticateCustomer } = await import('@/lib/auth/customer-auth')

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'token123',
        },
      })
      const result = await authenticateCustomer(request)

      expect(result).toBeNull()
    })
  })

  describe('validateProfile', () => {
    it('should validate required profile fields', async () => {
      const { validateProfile } = await import('@/lib/auth/profile-validation')

      const incompleteProfile = {
        name: 'Test User',
        email: 'test@example.com',
        // Missing phone
      }

      const result = validateProfile(incompleteProfile as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('phone')
    })

    it('should validate email format', async () => {
      const { validateProfile } = await import('@/lib/auth/profile-validation')

      const invalidEmailProfile = {
        name: 'Test User',
        email: 'invalid-email',
        phone: '1234567890',
      }

      const result = validateProfile(invalidEmailProfile as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('email')
    })

    it('should validate phone format', async () => {
      const { validateProfile } = await import('@/lib/auth/profile-validation')

      const invalidPhoneProfile = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '123', // Too short
      }

      const result = validateProfile(invalidPhoneProfile as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('phone')
    })

    it('should return valid for complete profile', async () => {
      const { validateProfile } = await import('@/lib/auth/profile-validation')

      const completeProfile = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: {
          country: 'India',
        },
      }

      const result = validateProfile(completeProfile as any)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})
