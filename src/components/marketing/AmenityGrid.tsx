'use client'

import { useAmenities } from '@/hooks/useAmenities'
import { AmenityMarquee } from '@/components/ui/AmenityMarquee'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function AmenityGrid() {
  const { amenities, loading, error } = useAmenities()

  if (loading) {
    return (
      <section id="amenities" className="mx-auto max-w-8xl px-4 py-8">
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="amenities" className="mx-auto max-w-8xl px-4 py-8">
        <div className="text-center text-muted-foreground py-8">
          Unable to load amenities at this time
        </div>
      </section>
    )
  }

  return (
    <section id="amenities" className="mx-auto max-w-8xl px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">What We Offer</h2>
        <p className="text-muted-foreground">
          Discover the amenities that make our properties special
        </p>
      </div>
      <AmenityMarquee
        amenities={amenities}
        variant="compact"
        showIcon={true}
        showDescription={false}
        maxItems={20}
        duration="40s"
        pauseOnHover={true}
        className="mx-auto"
      />
    </section>
  )
}

export default AmenityGrid
