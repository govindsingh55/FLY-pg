import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload/payload.config'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const slug = searchParams.get('slug')

    if (secret !== process.env.PREVIEW_SECRET) {
      return new Response('Invalid secret', { status: 401 })
    }

    const result = await payload.find({
      collection: 'properties',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (result.docs.length === 0) {
      return new Response('Property not found', { status: 404 })
    }

    const draft = await draftMode()
    draft.enable()
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }

  // Move redirect outside try-catch since redirect() throws an error intentionally
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  redirect(`/properties/${slug}`)
}
