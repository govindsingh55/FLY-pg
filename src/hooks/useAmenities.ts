import { useState, useEffect, useCallback } from 'react'
import type { Amenity } from '@/payload/payload-types'

interface UseAmenitiesReturn {
  amenities: Amenity[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export const useAmenities = (): UseAmenitiesReturn => {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAmenities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch amenities directly from the API
      const response = await fetch('/api/amenities?where[status][equals]=active&sort=name')
      if (!response.ok) {
        throw new Error('Failed to fetch amenities')
      }
      const data = await response.json()
      setAmenities(data.docs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load amenities')
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await loadAmenities()
  }, [loadAmenities])

  useEffect(() => {
    loadAmenities()
  }, [loadAmenities])

  return {
    amenities,
    loading,
    error,
    refresh,
  }
}

// Note: useAmenitiesByCategory has been removed since the Amenities collection
// doesn't have a category field. If you need category filtering, you'll need to
// add a category field to the Amenities collection first.
