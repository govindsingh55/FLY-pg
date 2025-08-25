import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ImageGallery from '@/components/marketing/property-detail/ImageGallery'
import AmenityGridForProperty from '@/components/marketing/property-detail/AmenityGridForProperty'
import NearbyLocations from '@/components/marketing/property-detail/NearbyLocations'
import RichText from '@/components/RichText'
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
    amenities?: string[]
    foodMenu?: { description?: any }
    nearby?: NearbyLocation[]
    rooms?: Room[]
    images?: Array<{ image: any; id: string; isCover: boolean }>
    address?: { address?: any; location?: { sector?: string; city?: string } }
  }
  bookingCard?: React.ReactNode
  className?: string
}

export default function PropertyDetailsSection({
  property,
  bookingCard,
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
        {/* Property Gallery - Full Width */}
        {property.images && property.images.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Property Gallery</h2>
            <ImageGallery
              images={property.images}
              addressRich={property.address?.address}
              localityLine={localityLine}
            />
          </div>
        )}

        {/* Main Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
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
            {property.foodMenu?.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lucide.UtensilsCrossed className="h-5 w-5 text-primary" />
                    Food Menu
                  </CardTitle>
                  <CardDescription>Delicious meals prepared fresh daily</CardDescription>
                </CardHeader>
                <CardContent>
                  <RichText
                    data={property.foodMenu.description}
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
          </div>

          {/* Right Column - Booking Card & Quick Info */}
          <div className="space-y-6">
            {/* Sticky Booking Card */}
            {bookingCard && <div className="lg:sticky lg:top-24 lg:self-start">{bookingCard}</div>}

            {/* Quick Property Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lucide.BarChart3 className="h-5 w-5 text-primary" />
                  Property Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.rooms && property.rooms.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Rooms</span>
                    <span className="font-semibold">{property.rooms.length}</span>
                  </div>
                )}
                {property.rooms && property.rooms.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Available Rooms</span>
                    <span className="font-semibold text-green-600">
                      {property.rooms.filter((r) => r.available !== false).length}
                    </span>
                  </div>
                )}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amenities</span>
                    <span className="font-semibold">{property.amenities.length}</span>
                  </div>
                )}
                {localityLine && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-2">
                      <Lucide.MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium">Location</div>
                        <div className="text-sm text-muted-foreground">{localityLine}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lucide.Phone className="h-5 w-5 text-primary" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm">
                  <Lucide.Calendar className="mr-2 h-4 w-4" />
                  Schedule Visit
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Lucide.MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Lucide.Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Room Types - Full Width Below */}
        {property.rooms && property.rooms.length > 0 && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lucide.Bed className="h-5 w-5 text-primary" />
                  Available Room Types
                </CardTitle>
                <CardDescription>Choose the perfect space for your lifestyle</CardDescription>
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
                          {room.available !== false && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Available
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize mb-3">
                          {room.roomType?.replace('_', ' ')}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">
                            ₹{room.rent?.toLocaleString()}/mo
                          </span>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
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
