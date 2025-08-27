import { useState, useEffect, useCallback } from 'react'
import { dashboardCache } from '@/lib/cache/dashboard-cache'

export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number,
): { data: T | null; loading: boolean; error: Error | null; refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(dashboardCache.get<T>(key))
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await dashboardCache.cacheApiResponse(key, undefined, fetchFn, ttl)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [key, fetchFn, ttl])

  useEffect(() => {
    if (!data) {
      fetchData()
    }
  }, [data, fetchData])

  return { data, loading, error, refetch: fetchData }
}
