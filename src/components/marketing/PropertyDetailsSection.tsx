import AmenityGridForProperty from '@/components/marketing/property-detail/AmenityGridForProperty'
import NearbyLocations from '@/components/marketing/property-detail/NearbyLocations'
import RichText from '@/components/RichText'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Amenity } from '@/payload/payload-types'
import * as Lucide from 'lucide-react'

interface Room {
  id: string
  name: string
  roomType?: string
  rent?: number
  available?: boolean
}

interface NearbyLocation {
  name: string
  distance: string
}

interface PropertyDetailsSectionProps {
  property: {
    id: string
    name: string
    description?: any
    amenities?: (string | Amenity)[]
    foodMenu?: { menu?: { description?: any }; price?: number }
    nearby?: NearbyLocation[]
    rooms?: Room[]
    images?: Array<{ image: any; id: string; isCover: boolean }>
    address?: { address?: any; location?: { sector?: string; city?: string } }
  }
  className?: string
}

export default function PropertyDetailsSection({
  property,
  className = '',
}: PropertyDetailsSectionProps) {
  const sector =
    typeof property.address?.location?.sector === 'string'
      ? property.address.location.sector
      : undefined
  const city =
    typeof property.address?.location?.city === 'string'
      ? property.address.location.city
      : undefined
  const localityLine = [sector, city].filter(Boolean).join(', ')

  return (
    <section className={`py-16 ${className}`}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Main Content - Simple Stacked Layout */}
        <div className="space-y-8">
          {/* About Section */}
          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lucide.Info className="h-5 w-5 text-primary" />
                  About {property.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichText data={property.description} enableGutter={false} enableProse={true} />
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lucide.Star className="h-5 w-5 text-primary" />
                  Amenities & Features
                </CardTitle>
                <CardDescription>Everything you need for comfortable living</CardDescription>
              </CardHeader>
              <CardContent>
                <AmenityGridForProperty items={property.amenities} />
              </CardContent>
            </Card>
          )}

          {/* Food Menu */}
          {property.foodMenu?.menu?.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lucide.UtensilsCrossed className="h-5 w-5 text-primary" />
                  Food Menu
                </CardTitle>
                <CardDescription>
                  Delicious meals prepared fresh daily
                  {property.foodMenu.price && (
                    <span className="block text-green-600 font-medium mt-1">
                      Monthly Food Charge: ₹{property.foodMenu.price.toLocaleString()}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichText
                  data={property.foodMenu.menu.description}
                  enableGutter={false}
                  enableProse={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Nearby Locations */}
          {property.nearby && property.nearby.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lucide.MapPin className="h-5 w-5 text-primary" />
                  Nearby Locations
                </CardTitle>
                <CardDescription>Convenient access to key locations</CardDescription>
              </CardHeader>
              <CardContent>
                <NearbyLocations locations={property.nearby} />
              </CardContent>
            </Card>
          )}

          {/* Property Overview Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lucide.BarChart3 className="h-5 w-5 text-primary" />
                Property Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.rooms && property.rooms.length > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{property.rooms.length}</div>
                    <div className="text-sm text-muted-foreground">Total Rooms</div>
                  </div>
                )}
                {property.rooms && property.rooms.length > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {property.rooms.filter((r) => r.available !== false).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Available</div>
                  </div>
                )}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {property.amenities.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Amenities</div>
                  </div>
                )}
                {localityLine && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Lucide.MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm font-medium">Location</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{localityLine}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Types - Full Width Below */}
        {property.rooms && property.rooms.length > 0 && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lucide.Bed className="h-5 w-5 text-primary" />
                  Room Types & Pricing
                </CardTitle>
                <CardDescription>
                  Explore our comfortable living spaces designed for modern lifestyles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {property.rooms.map((room) => (
                    <Card
                      key={room.id}
                      className="border border-border/50 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{room.name}</h4>
                          {room.available !== false ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              Occupied
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize mb-3">
                          {room.roomType?.replace('_', ' ')}
                        </p>
                        <div className="text-center">
                          <span className="text-2xl font-bold text-primary">
                            ₹{room.rent?.toLocaleString()}
                          </span>
                          <div className="text-sm text-muted-foreground">per month</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
