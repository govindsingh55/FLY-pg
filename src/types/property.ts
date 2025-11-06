import type { Media } from '@/payload/payload-types'

export type RoomSummary = {
  id: string
  name: string
  roomType: 'single' | 'two_sharing' | 'three_sharing'
  rent: number
  available?: boolean
  images?: { image?: string | Media | null; id?: string | null; isCover?: boolean }[]
}

export type PropertySummary = {
  id?: string
  name?: string
  slug?: string
  images?: { image?: string | Media | null; isCover?: boolean; id?: string | null }[]
  description?: unknown
  address?: {
    address?: unknown
    location?: { mapLink?: string; city?: string; sector?: string }
  }
  propertyType?: string
  genderType?: string
  amenities?: string[]
  foodMenu?: { menu?: unknown }
  nearbyLocations?: { name?: string; distance?: string }[]
  rooms?: RoomSummary[]
  isPreview?: boolean
}
