import AmenityGridForProperty from '@/components/marketing/property-detail/AmenityGridForProperty'
import BookingCard from '@/components/marketing/property-detail/BookingCard'
import ImageGallery from '@/components/marketing/property-detail/ImageGallery'
import NearbyLocations from '@/components/marketing/property-detail/NearbyLocations'
import PropertyHeader from '@/components/marketing/property-detail/PropertyHeader'
import RichText from '@/components/RichText'
import { PropertyDetailProvider } from '@/lib/state/propertyDetail'
import type { Media as MediaType } from '@/payload/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

type Params = Promise<{ slug: string }>

async function fetchProperty(slug: string) {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'properties',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  const doc = res.docs[0]
  if (!doc) return null
  // Normalize images
  const images = Array.isArray(doc.images) ? doc.images : []
  // Rooms
  const rooms = Array.isArray(doc.rooms)
    ? doc.rooms
        .map((r: any) => ({
          id: r.id,
          name: r.name,
          roomType: r.roomType,
          rent: r.rent,
          available: r.available,
        }))
        .filter(Boolean)
    : []
  return { ...doc, images, rooms }
}

export default async function PropertyDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const prop = await fetchProperty(slug)
  if (!prop) return <div className="mx-auto max-w-6xl px-4 py-8">Property not found.</div>
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
    prop.foodMenu && typeof prop.foodMenu === 'object' && 'description' in prop.foodMenu
      ? (prop.foodMenu as any).description
      : undefined

  return (
    <PropertyDetailProvider>
      <div className="mx-auto max-w-6xl">
        <PropertyHeader
          name={prop.name}
          propertyType={prop.propertyType}
          genderType={prop.genderType}
          mapLink={prop.address?.location?.mapLink}
        />
        <div className="grid grid-cols-1 gap-6 px-4 pb-16 md:grid-cols-3 md:items-start">
          <div className="md:col-span-2 space-y-6">
            <ImageGallery
              images={prop.images as { image: MediaType; id: string; isCover: boolean }[]}
              addressRich={prop.address?.address as any}
              localityLine={[sector, city].filter(Boolean).join(', ')}
            />
            {/* About */}
            {prop.description ? (
              <section className="max-w-none">
                <h3 className="mb-2 text-lg font-semibold text-primary">About the Property</h3>
                <RichText data={prop.description as any} />
              </section>
            ) : null}

            {/* Food Menu */}
            {foodMenuDesc ? (
              <section className="mt-6 max-w-none">
                <h3 className="mb-2 text-lg font-semibold text-primary">Food Menu</h3>
                <RichText data={foodMenuDesc as any} />
              </section>
            ) : null}

            <AmenityGridForProperty items={(prop.amenities as string[]) || []} />
            <NearbyLocations locations={nearby} />
          </div>
          <div className="sticky top-24 self-start mt-4">
            <BookingCard rooms={prop.rooms} />
          </div>
        </div>
      </div>
    </PropertyDetailProvider>
  )
}
