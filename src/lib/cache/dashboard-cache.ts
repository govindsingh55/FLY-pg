interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
}

class DashboardCache {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes
  private maxSize = 100

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL
    this.maxSize = options.maxSize || this.maxSize
  }

  // Set a value in cache
  set<T>(key: string, data: T, ttl?: number): void {
    // Remove expired items first
    this.cleanup()

    // Check if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    }

    this.cache.set(key, item)
  }

  // Get a value from cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Check if item is expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Delete a specific key
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache size
  size(): number {
    this.cleanup()
    return this.cache.size
  }

  // Get cache keys
  keys(): string[] {
    this.cleanup()
    return Array.from(this.cache.keys())
  }

  // Clean up expired items
  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Evict oldest item when cache is full
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Generate cache key for API requests
  static generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : ''
    return `${endpoint}:${paramString}`
  }

  // Cache API response with automatic key generation
  async cacheApiResponse<T>(
    endpoint: string,
    params: Record<string, any> | undefined,
    fetchFn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const key = DashboardCache.generateKey(endpoint, params)

    // Check cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch fresh data
    try {
      const data = await fetchFn()
      this.set(key, data, ttl)
      return data
    } catch (error) {
      // Don't cache errors
      throw error
    }
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // Invalidate all cache entries for a specific endpoint
  invalidateEndpoint(endpoint: string): void {
    this.invalidatePattern(`^${endpoint}:`)
  }
}

// Create singleton instance
export const dashboardCache = new DashboardCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
})

// Cache hooks for React components
export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number,
): { data: T | null; loading: boolean; error: Error | null; refetch: () => Promise<void> } {
  // This would need to be implemented in a separate React hook file
  // For now, returning a basic structure
  return {
    data: null,
    loading: false,
    error: null,
    refetch: async () => {},
  }
}

// Utility functions for common cache operations
export const cacheUtils = {
  // Cache customer profile data
  cacheProfile: (customerId: string, data: any) => {
    dashboardCache.set(`profile:${customerId}`, data, 10 * 60 * 1000) // 10 minutes
  },

  // Cache booking data
  cacheBookings: (customerId: string, data: any) => {
    dashboardCache.set(`bookings:${customerId}`, data, 2 * 60 * 1000) // 2 minutes
  },

  // Cache payment data
  cachePayments: (customerId: string, data: any) => {
    dashboardCache.set(`payments:${customerId}`, data, 2 * 60 * 1000) // 2 minutes
  },

  // Cache notification data
  cacheNotifications: (customerId: string, data: any) => {
    dashboardCache.set(`notifications:${customerId}`, data, 1 * 60 * 1000) // 1 minute
  },

  // Invalidate customer data
  invalidateCustomerData: (customerId: string) => {
    dashboardCache.invalidatePattern(`.*:${customerId}`)
  },

  // Invalidate all booking data
  invalidateBookings: () => {
    dashboardCache.invalidatePattern(`^bookings:`)
  },

  // Invalidate all payment data
  invalidatePayments: () => {
    dashboardCache.invalidatePattern(`^payments:`)
  },

  // Invalidate all notification data
  invalidateNotifications: () => {
    dashboardCache.invalidatePattern(`^notifications:`)
  },
}

export default DashboardCache
