import { properties } from '@/data'

export async function GET(request: Request) {
  return Response.json({
    docs: properties,
  })
}
