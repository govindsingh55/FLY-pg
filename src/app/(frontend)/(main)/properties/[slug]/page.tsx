import AmenityGridForProperty from '@/components/marketing/property-detail/AmenityGridForProperty'
import BookingCard from '@/components/marketing/property-detail/BookingCard'
import MediaGallery from '@/components/marketing/property-detail/MediaGallery'
import NearbyLocations from '@/components/marketing/property-detail/NearbyLocations'
import PropertyHeader from '@/components/marketing/property-detail/PropertyHeader'
import ShareButton from '@/components/marketing/property-detail/ShareButton'
import RichText from '@/components/RichText'
import { PropertyDetailProvider } from '@/lib/state/propertyDetail'
import type { Media as MediaType } from '@/payload/payload-types'
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import type { PropertySummary, RoomSummary } from '@/types/property'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

// Avoid static generation (which would attempt DB connection during build)
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

type Params = Promise<{ slug: string }>

async function fetchProperty(slug: string): Promise<PropertySummary | null> {
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

    const images = Array.isArray(doc.images)
      ? (doc.images as unknown[]).map((img: unknown) => {
          const ii = img as { image?: unknown; id?: string | null; isCover?: boolean | null }
          return {
            image: ii.image as unknown as MediaType,
            id: ii.id ?? undefined,
            isCover: Boolean(ii.isCover),
          }
        })
      : []

    const rooms: RoomSummary[] = Array.isArray(doc.rooms)
      ? doc.rooms
          .map((r) => {
            const rr = r as Partial<RoomSummary>
            return {
              id: String(rr.id),
              name: String(rr.name),
              roomType: (rr.roomType as RoomSummary['roomType']) || 'single',
              rent: Number(rr.rent) || 0,
              available: rr.available ?? true,
              images: Array.isArray(rr.images)
                ? (rr.images as unknown[]).map((img: unknown) => {
                    const ii = img as {
                      image?: unknown
                      id?: string | null
                      isCover?: boolean | null
                    }
                    return {
                      image: ii.image as unknown as MediaType,
                      id: ii.id ?? undefined,
                      isCover: Boolean(ii.isCover),
                    }
                  })
                : [],
            }
          })
          .filter(Boolean)
      : []

    const result = { ...doc, images, rooms, isPreview: isEnabled } as unknown as PropertySummary
    return result
  } catch (e) {
    console.error('[property detail] fetchProperty failed:', (e as Error)?.message)
    return null
  }
}

export default async function PropertyDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const propertyData = await fetchProperty(slug)
  console.log({ propertyData, slug })
  if (!propertyData) return <div className="mx-auto max-w-8xl px-4 py-8">Property not found.</div>
  const sector =
    typeof propertyData.address?.location?.sector === 'string'
      ? propertyData.address.location.sector
      : undefined
  const city =
    typeof propertyData.address?.location?.city === 'string'
      ? propertyData.address.location.city
      : undefined
  // We will render rich text properly via <RichText /> in PropertyHeader
  const nearby = (propertyData.nearbyLocations || []).map(
    (l: { name?: string; distance?: string }) => ({
      name: l?.name ?? '',
      distance: l?.distance ?? '',
    }),
  )

  const menuObj =
    (propertyData.foodMenu?.menu as { description?: unknown } | undefined) ?? undefined
  const foodMenuDesc = menuObj
    ? (menuObj.description as DefaultTypedEditorState | undefined)
    : undefined

  const addressRich = propertyData.address?.address as DefaultTypedEditorState | undefined

  // Prepare gallery props with strict types expected by MediaGallery
  const galleryImages: { image: MediaType; id: string; isCover: boolean }[] = (
    propertyData.images || []
  ).map((img) => ({
    image: img?.image as MediaType,
    id: String(img?.id ?? ''),
    isCover: Boolean(img?.isCover),
  }))

  const galleryRooms = (propertyData.rooms || []).map((r) => ({
    id: String(r.id),
    name: r.name,
    roomType: r.roomType,
    images: (r.images || []).map((img) => ({
      image: img.image as MediaType,
      id: String(img.id ?? ''),
      isCover: Boolean(img.isCover),
    })),
  }))

  return (
    <PropertyDetailProvider>
      <div className="mx-auto max-w-8xl w-full">
        {/* Preview Banner */}
        {propertyData.isPreview && (
          <div className="bg-yellow-500 text-black px-4 py-2 text-center font-semibold">
            🔍 Preview Mode - This is a draft version
          </div>
        )}
        <PropertyHeader
          name={propertyData.name ?? ''}
          propertyType={propertyData.propertyType}
          genderType={propertyData.genderType}
          mapLink={propertyData.address?.location?.mapLink}
          shareButton={<ShareButton propertyName={propertyData.name ?? ''} />}
        />
        <div className="grid grid-cols-1 gap-6 px-4 pb-16 md:grid-cols-3 md:items-start">
          <div className="md:col-span-2 space-y-6">
            <MediaGallery
              images={galleryImages}
              rooms={galleryRooms}
              addressRich={addressRich}
              localityLine={[sector, city].filter(Boolean).join(', ')}
            />
            {/* About */}
            {propertyData.description ? (
              <section className="max-w-none">
                <h3 className="mb-2 text-3xl font-semibold text-primary text-center md:text-left">
                  About <span className="text-accent">Property</span>
                </h3>
                <RichText data={propertyData.description as DefaultTypedEditorState} />
              </section>
            ) : null}

            {/* Food Menu */}
            {foodMenuDesc ? (
              <section className="mt-6 max-w-none">
                <h3 className="mb-2 text-3xl font-semibold text-primary text-center md:text-left">
                  Food <span className="text-accent">Menu</span>
                </h3>
                <RichText data={foodMenuDesc as DefaultTypedEditorState} />
              </section>
            ) : null}

            <AmenityGridForProperty
              items={(propertyData.amenities as string[]) || []}
              headingClassName="text-center md:text-left"
            />
            <NearbyLocations locations={nearby} />
          </div>
          <div className="sticky top-24 self-start mt-4">
            <BookingCard property={propertyData} />
          </div>
        </div>
      </div>
    </PropertyDetailProvider>
  )
}
