'use client'

import { useAmenities } from '@/hooks/useAmenities'
import { AmenityGrid as DynamicAmenityGrid } from '@/components/ui/AmenityGrid'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function AmenityGrid() {
  const { amenities, loading, error } = useAmenities()

  if (loading) {
    return (
      <section id="amenities" className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="amenities" className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center text-muted-foreground py-8">
          Unable to load amenities at this time
        </div>
      </section>
    )
  }

  return (
    <section id="amenities" className="mx-auto max-w-6xl px-4 py-8">
      <DynamicAmenityGrid
        amenities={amenities}
        columns={6}
        variant="compact"
        showIcon={true}
        showDescription={false}
        maxItems={12}
        className="mx-auto"
      />
    </section>
  )
}

export default AmenityGrid
