import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Hook to revalidate the home page when properties are created, updated, or deleted
 * This ensures the ISR cache is invalidated when property data changes
 */
export const revalidateHomePage: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  try {
    // Only revalidate if the property status affects the published count
    const shouldRevalidate =
      operation === 'create' ||
      operation === 'update' ||
      (operation === 'delete' && doc._status === 'published')

    if (!shouldRevalidate) {
      return doc
    }

    const revalidationSecret = process.env.REVALIDATION_SECRET
    if (!revalidationSecret) {
      console.warn('REVALIDATION_SECRET not set, skipping revalidation')
      return doc
    }

    // Call the revalidation API route
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const revalidateUrl = `${baseUrl}/api/revalidate`

    await fetch(revalidateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: '/',
        tag: 'home-page',
        secret: revalidationSecret,
      }),
    })

    console.log(`[Properties] Revalidated home page after ${operation}`)
  } catch (error) {
    console.error('[Properties] Failed to revalidate home page:', error)
    // Don't throw the error to avoid breaking the main operation
  }

  return doc
}

/**
 * Hook to revalidate the home page when properties are deleted
 */
export const revalidateHomePageAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  try {
    // Only revalidate if the deleted property was published
    if (doc._status !== 'published') {
      return doc
    }

    const revalidationSecret = process.env.REVALIDATION_SECRET
    if (!revalidationSecret) {
      console.warn('REVALIDATION_SECRET not set, skipping revalidation')
      return doc
    }

    // Call the revalidation API route
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const revalidateUrl = `${baseUrl}/api/revalidate`

    await fetch(revalidateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: '/',
        tag: 'home-page',
        secret: revalidationSecret,
      }),
    })

    console.log('[Properties] Revalidated home page after delete')
  } catch (error) {
    console.error('[Properties] Failed to revalidate home page after delete:', error)
    // Don't throw the error to avoid breaking the main operation
  }

  return doc
}
