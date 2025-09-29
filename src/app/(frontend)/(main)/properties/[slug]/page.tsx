import AmenityGridForProperty from '@/components/marketing/property-detail/AmenityGridForProperty'
import BookingCard from '@/components/marketing/property-detail/BookingCard'
import MediaGallery from '@/components/marketing/property-detail/MediaGallery'
import NearbyLocations from '@/components/marketing/property-detail/NearbyLocations'
import PropertyHeader from '@/components/marketing/property-detail/PropertyHeader'
import RichText from '@/components/RichText'
import { PropertyDetailProvider } from '@/lib/state/propertyDetail'
import type { Media as MediaType } from '@/payload/payload-types'
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

// Avoid static generation (which would attempt DB connection during build)
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

type Params = Promise<{ slug: string }>

async function fetchProperty(slug: string) {
  try {
    const { isEnabled } = await draftMode()
    const payload = await getPayload({ config })

    let res
    if (isEnabled) {
      // In preview mode, fetch draft content
      res = await payload.find({
        collection: 'properties',
        where: { slug: { equals: slug } },
        depth: 2,
        limit: 1,
        draft: true, // This will fetch draft content
      })
    } else {
      // Normal mode, fetch published content
      res = await payload.find({
        collection: 'properties',
        where: {
          slug: { equals: slug },
          _status: { equals: 'published' },
        },
        depth: 2,
        limit: 1,
      })
    }

    const doc = res.docs[0]
    if (!doc) return null

    const images = Array.isArray(doc.images) ? doc.images : []
    const rooms = Array.isArray(doc.rooms)
      ? doc.rooms
          .map((r: any) => ({
            id: r.id,
            name: r.name,
            roomType: r.roomType,
            rent: r.rent,
            available: r.available,
            images: Array.isArray(r.images) ? r.images : [],
          }))
          .filter(Boolean)
      : []
    return { ...doc, images, rooms, isPreview: isEnabled }
  } catch (e) {
    console.error('[property detail] fetchProperty failed:', (e as Error)?.message)
    return null
  }
}

export default async function PropertyDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const prop = await fetchProperty(slug)
  console.log({ prop, slug })
  if (!prop) return <div className="mx-auto max-w-8xl px-4 py-8">Property not found.</div>
  const sector =
    typeof prop.address?.location?.sector === 'string' ? prop.address.location.sector : undefined
  const city =
    typeof prop.address?.location?.city === 'string' ? prop.address.location.city : undefined
  // We will render rich text properly via <RichText /> in PropertyHeader
  const nearby = (prop.nearbyLocations || []).map((l: any) => ({
    name: l?.name ?? '',
    distance: l?.distance ?? '',
  }))
  const foodMenuDesc =
    prop.foodMenu &&
    typeof prop.foodMenu === 'object' &&
    'menu' in prop.foodMenu &&
    prop.foodMenu.menu &&
    typeof prop.foodMenu.menu === 'object' &&
    'description' in prop.foodMenu.menu
      ? (prop.foodMenu.menu as any).description
      : undefined

  return (
    <PropertyDetailProvider>
      <div className="mx-auto max-w-8xl w-full">
        {/* Preview Banner */}
        {prop.isPreview && (
          <div className="bg-yellow-500 text-black px-4 py-2 text-center font-semibold">
            🔍 Preview Mode - This is a draft version
          </div>
        )}
        <PropertyHeader
          name={prop.name}
          propertyType={prop.propertyType}
          genderType={prop.genderType}
          mapLink={prop.address?.location?.mapLink}
        />
        <div className="grid grid-cols-1 gap-6 px-4 pb-16 md:grid-cols-3 md:items-start">
          <div className="md:col-span-2 space-y-6">
            <MediaGallery
              images={prop.images as { image: MediaType; id: string; isCover: boolean }[]}
              rooms={prop.rooms}
              addressRich={prop.address?.address as any}
              localityLine={[sector, city].filter(Boolean).join(', ')}
            />
            {/* About */}
            {prop.description ? (
              <section className="max-w-none">
                <h3 className="mb-2 text-3xl font-semibold text-primary text-center md:text-left">
                  About <span className="text-accent">Property</span>
                </h3>
                <RichText data={prop.description as any} />
              </section>
            ) : null}

            {/* Food Menu */}
            {foodMenuDesc ? (
              <section className="mt-6 max-w-none">
                <h3 className="mb-2 text-3xl font-semibold text-primary text-center md:text-left">
                  Food <span className="text-accent">Menu</span>
                </h3>
                <RichText data={foodMenuDesc as any} />
              </section>
            ) : null}

            <AmenityGridForProperty
              items={(prop.amenities as string[]) || []}
              headingClassName="text-center md:text-left"
            />
            <NearbyLocations locations={nearby} />
          </div>
          <div className="sticky top-24 self-start mt-4">
            <BookingCard rooms={prop.rooms} propertyId={String((prop as any).id ?? '')} />
          </div>
        </div>
      </div>
    </PropertyDetailProvider>
  )
}
