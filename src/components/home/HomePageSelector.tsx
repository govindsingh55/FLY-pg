import { getPayload } from 'payload'
import config from '@payload-config'
import MultiPropertyHome from './multi-property-home'
import SinglePropertyHome from './single-property-home'

// Enable ISR with revalidation every 60 seconds and when properties change
export const revalidate = 60
export const fetchCache = 'default-cache'

async function getPropertyCount() {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'properties',
      where: {
        _status: { equals: 'published' },
      },
      limit: 0, // We only need the count
    })
    console.log('[HomePageSelector] getPropertyCount res:', res)
    return res.totalDocs
  } catch (e) {
    console.error('[HomePageSelector] getPropertyCount failed:', (e as Error)?.message)
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
