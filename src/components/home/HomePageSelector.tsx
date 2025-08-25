import { getPayload } from 'payload'
import config from '@payload-config'
import MultiPropertyHome from './multi-property-home'
import SinglePropertyHome from './single-property-home'

// Avoid static generation – ensures we always query the latest data
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

async function getPropertyCount() {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'properties',
      limit: 0, // We only need the count
    })
    return res.totalDocs
  } catch (e) {
    console.error('[HomePageSelector] getPropertyCount failed:', (e as any)?.message)
    return 0
  }
}

export default async function HomePageSelector() {
  const propertyCount = await getPropertyCount()

  // If we have only one property, show the single property home page
  // If we have multiple properties, show the multi-property home page
  // If we have no properties, the single property home page will handle the empty state
  if (propertyCount <= 1) {
    return <SinglePropertyHome />
  } else {
    return <MultiPropertyHome />
  }
}
