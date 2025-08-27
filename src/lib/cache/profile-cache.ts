interface CachedProfileData {
  data: any
  timestamp: number
  ttl: number
}

class ProfileCache {
  private cache = new Map<string, CachedProfileData>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const timestamp = Date.now()
    this.cache.set(key, { data, timestamp, ttl })
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)

    if (!cached) {
      return null
    }

    const now = Date.now()
    const isExpired = now - cached.timestamp > cached.ttl

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
const profileCache = new ProfileCache()

// Cache key generators
export function generateProfileCacheKey(customerId: string): string {
  return `profile:${customerId}`
}

export function generateProfileAvatarCacheKey(customerId: string): string {
  return `profile:avatar:${customerId}`
}

export function generateProfilePreferencesCacheKey(customerId: string): string {
  return `profile:preferences:${customerId}`
}

// Cache operations
export function cacheProfileData(customerId: string, data: any, ttl?: number): void {
  const key = generateProfileCacheKey(customerId)
  profileCache.set(key, data, ttl)
}

export function getCachedProfileData(customerId: string): any | null {
  const key = generateProfileCacheKey(customerId)
  return profileCache.get(key)
}

export function invalidateProfileCache(customerId: string): void {
  const keys = [
    generateProfileCacheKey(customerId),
    generateProfileAvatarCacheKey(customerId),
    generateProfilePreferencesCacheKey(customerId),
  ]

  keys.forEach((key) => profileCache.delete(key))
}

export function cacheProfileAvatar(customerId: string, avatarData: any, ttl?: number): void {
  const key = generateProfileAvatarCacheKey(customerId)
  profileCache.set(key, avatarData, ttl)
}

export function getCachedProfileAvatar(customerId: string): any | null {
  const key = generateProfileAvatarCacheKey(customerId)
  return profileCache.get(key)
}

export function cacheProfilePreferences(customerId: string, preferences: any, ttl?: number): void {
  const key = generateProfilePreferencesCacheKey(customerId)
  profileCache.set(key, preferences, ttl)
}

export function getCachedProfilePreferences(customerId: string): any | null {
  const key = generateProfilePreferencesCacheKey(customerId)
  return profileCache.get(key)
}

// Cache middleware for API routes
export function withProfileCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheKey: string,
  ttl?: number,
): T {
  return (async (...args: any[]) => {
    // Try to get from cache first
    const cached = profileCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // If not in cache, execute the function
    const result = await fn(...args)

    // Cache the result
    if (result) {
      profileCache.set(cacheKey, result, ttl)
    }

    return result
  }) as T
}

// Export the cache instance for debugging
export { profileCache }

// Cleanup expired entries every 10 minutes
setInterval(
  () => {
    profileCache.cleanup()
  },
  10 * 60 * 1000,
)
