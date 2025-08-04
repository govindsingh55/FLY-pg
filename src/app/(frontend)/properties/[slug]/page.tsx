import type { Metadata } from 'next'
import React from 'react'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { cache } from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import Link from 'next/link'
import Slider from './Slider'
import { FoodMenu, Room } from '@/payload-types'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/' + slug

  // Always fetch with draft: true and overrideAccess: true in preview mode
  let page: RequiredDataFromCollectionSlug<'properties'> | null
  page = await queryPropertyBySlug({
    slug,
    draft,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const rooms = (Array.isArray(page.rooms) ? (page.rooms as Room[]) : []).filter(
    (r): r is Room => !!r && typeof r === 'object' && 'id' in r,
  )

  return (
    <article className="container pt-10 pb-16">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      {/* Header: title + address + map */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{page.name}</h1>
            {page.address?.address && (
              <RichText
                className="mt-2 text-sm text-muted-foreground"
                data={page.address.address}
              />
            )}
          </div>
          <div className="shrink-0">
            {page.address?.location?.mapLink ? (
              <Link
                href={
                  page.address.location.mapLink.startsWith('http')
                    ? page.address.location.mapLink
                    : `/properties/${page.address.location.mapLink}`
                }
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent"
                prefetch={false}
              >
                View on Map
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main grid: media left, booking card right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {Array.isArray(page.images) && page.images.length > 0 && (
            <div className="rounded-lg border p-2 md:p-3 bg-card">
              <Slider images={page.images} alt={page.name} />
            </div>
          )}
        </div>

        {/* Booking card */}
        <aside className="lg:col-span-4">
          <div className="rounded-xl border shadow-sm p-4 sticky top-20">
            <h2 className="text-lg font-medium mb-3">Select Sharing Type</h2>

            {/* Segmented buttons (visual only for now) */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['Private Room', 'Two Sharing', 'Three Sharing'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={`text-xs md:text-sm rounded-md border px-2 py-2 ${i === 0 ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mb-3">
              <div className="text-sm font-medium mb-1">Select Room Type</div>
              <div className="space-y-2">
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <label
                      key={room.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-accent cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <input type="radio" name="room" className="accent-primary" />
                        <span className="text-sm">{room.name}</span>
                      </span>
                      <span className="text-sm font-semibold">
                        {room.rent ? `₹ ${room.rent}/month` : ''}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No rooms available</div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Schedule a Visit
              </button>
              <button
                type="button"
                className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90"
              >
                Confirm Details
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Sections */}
      <section className="mt-10 space-y-10">
        {page.description && (
          <div>
            <h2 className="text-xl font-semibold mb-2">About the Property</h2>
            <RichText data={page.description} />
          </div>
        )}

        {rooms.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Room Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="rounded-lg border p-4">
                  <div className="text-base font-medium">{room.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {room.roomType || ''}
                  </div>
                  {room.rent && (
                    <div className="mt-2 text-sm">
                      starting from <span className="font-semibold">₹ {room.rent}/month</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {page.foodMenu && typeof page.foodMenu === 'object' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Food Menu</h2>
            <RichText data={(page.foodMenu as FoodMenu).description} />
          </div>
        )}

        {Array.isArray(page.amenities) && page.amenities.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Amazing Amenities</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {page.amenities.map((amenity) => {
                const icon = getAmenityIcon(amenity)
                return (
                  <li
                    key={amenity}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center">{icon}</span>
                    <span>{amenity}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {Array.isArray(page.nearbyLocations) && page.nearbyLocations.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Nearby Locations</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {page.nearbyLocations.map((location, idx) => (
                <li key={idx} className="rounded-lg border p-4">
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-muted-foreground">{location.distance}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </article>
  )
}

/**
 * Local mapping of amenity names (as stored in collection) to simple inline SVG icons.
 * No external dependency, keeps bundle small. Add to this as amenities grow.
 */
function getAmenityIcon(name: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    AC: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <path d="M3 8h18M3 12h18M3 16h18" strokeWidth="1.5" />
        <path d="M7 20l2-2-2-2M17 20l-2-2 2-2" strokeWidth="1.5" />
      </svg>
    ),
    'Bed Sheet': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <rect x="3" y="7" width="18" height="10" rx="2" strokeWidth="1.5" />
        <path d="M7 7v10M17 7v10" strokeWidth="1.5" />
      </svg>
    ),
    Security: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <path d="M12 3l8 4v5a8 8 0 0 1-8 8 8 8 0 0 1-8-8V7l8-4z" strokeWidth="1.5" />
        <path d="M9 12l2 2 4-4" strokeWidth="1.5" />
      </svg>
    ),
    Pillow: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <rect x="4" y="6" width="16" height="12" rx="4" strokeWidth="1.5" />
      </svg>
    ),
    Wash: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <path d="M4 10c4-6 12-6 16 0" strokeWidth="1.5" />
        <path d="M6 14h12M8 18h8" strokeWidth="1.5" />
      </svg>
    ),
    Refrigerator: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <rect x="7" y="3" width="10" height="18" rx="2" strokeWidth="1.5" />
        <path d="M7 11h10" strokeWidth="1.5" />
        <circle cx="9.5" cy="8" r="0.8" fill="currentColor" />
      </svg>
    ),
    'Power Backup': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <path d="M13 2L3 14h7v8l10-12h-7z" strokeWidth="1.5" />
      </svg>
    ),
    CCTV: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <rect x="3" y="6" width="14" height="6" rx="2" strokeWidth="1.5" />
        <path d="M17 9l4 2-3 5" strokeWidth="1.5" />
        <path d="M7 12v4h5" strokeWidth="1.5" />
      </svg>
    ),
    'House Keeping': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <path d="M4 20h16M6 20V8l6-4 6 4v12" strokeWidth="1.5" />
        <path d="M9 20v-6h6v6" strokeWidth="1.5" />
      </svg>
    ),
    Reception: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <circle cx="8" cy="7" r="3" strokeWidth="1.5" />
        <rect x="3" y="12" width="18" height="7" rx="2" strokeWidth="1.5" />
      </svg>
    ),
    Parking: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <rect x="4" y="4" width="12" height="16" rx="2" strokeWidth="1.5" />
        <path d="M10 8h3.5a2.5 2.5 0 0 1 0 5H10V8z" strokeWidth="1.5" />
      </svg>
    ),
    WiFi: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <path d="M2 8c6-6 14-6 20 0" strokeWidth="1.5" />
        <path d="M5 11c4-4 10-4 14 0" strokeWidth="1.5" />
        <path d="M8 14c2-2 6-2 8 0" strokeWidth="1.5" />
        <circle cx="12" cy="18" r="1" fill="currentColor" />
      </svg>
    ),
  }

  return (
    map[name] ?? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
        <path d="M12 8v4l3 3" strokeWidth="1.5" />
      </svg>
    )
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'properties',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const page = await queryPropertyBySlug({
    slug,
    draft,
  })

  return generateMeta({ doc: page })
}

type PropertyQueryArgs = { slug: string; draft?: boolean }
const queryPropertyBySlug = cache(async ({ slug, draft = false }: PropertyQueryArgs) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'properties',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
