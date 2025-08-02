import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { Media } from '@/components/Media'

type Args = {
  searchParams: Promise<{
    city?: string
    propertyType?: string
    priceRange?: string
    sharingType?: string
    q?: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { city, q } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  // Build where clause from filters
  const where: any = {}
  if (city) where['location.city'] = { equals: city }
  if (q) {
    where.or = [{ name: { like: q } }, { description: { like: q } }, { slug: { like: q } }]
  }

  const properties = await payload.find({
    collection: 'properties',
    depth: 1,
    limit: 12,
    pagination: false,
    ...(Object.keys(where).length > 0 ? { where } : {}),
  })
  console.log('properties', JSON.stringify(properties, null, 2))

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search Properties</h1>
          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>
      {properties.docs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.docs.map((property: any, idx: number) => {
            return (
              <div
                key={property.slug || idx}
                className="bg-card border border-border rounded-lg shadow p-4 flex flex-col"
              >
                <Media resource={property.images?.[0]?.image} size="33vw" />
                <h2 className="text-lg font-semibold mb-1">
                  {property.name || property.title || ''}
                </h2>
                <a href={`/property/${property.slug}`} className="mt-auto text-primary underline">
                  View Details
                </a>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="container">No results found.</div>
      )}
      <div>propery card</div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Search`,
  }
}
