import RichText from '@/components/RichText'
import { Badge } from '@/components/ui/badge'
import { Amenity } from '@/payload/payload-types'
import * as Lucide from 'lucide-react'
import {
  PropertySection,
  PropertySectionContent,
  PropertySectionDescription,
  PropertySectionTitle,
} from '../sections/PropertySection'
import { Marquee } from '../ui/marquee'
import IconByName from './IconByName'

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
      <div className="mx-auto max-w-8xl px-6">
        {/* Main Content - Simple Stacked Layout */}
        <div className="space-y-8">
          {/* About Section */}
          {property.description && property.description.length > 0 && (
            <div className="rounded-lg p-6">
              <div className="mb-4">
                <h2 className="flex items-center justify-center gap-2 text-3xl font-semibold text-primary">
                  About <span className="text-accent">{property.name}</span>
                </h2>
              </div>
              <div className="text-center max-w-6xl mx-auto">
                <RichText
                  data={property.description}
                  enableGutter={false}
                  enableProse={true}
                  className="text-center"
                />
              </div>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mx-auto w-full px-1">
              <h3 className="mb-3 text-3xl font-semibold text-primary text-center mb-8">
                Amazing <span className="text-accent">Amenities</span>
              </h3>
              {/* <AmenityGridForProperty
                items={property.amenities}
                headingClassName="text-center mb-8"
                align="center"
              /> */}
              <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                <Marquee pauseOnHover className="[--duration:20s]">
                  {property.amenities.map((amenity: string | Amenity) => (
                    <div
                      key={typeof amenity === 'string' ? amenity : amenity.id}
                      className="flex flex-col items-center justify-center gap-1 md:gap-2 rounded-lg border border-accent/35 bg-card px-2 py-3 md:px-3 md:py-4 text-center shadow-sm transition-all duration-200 hover:shadow-md hover:border-2 hover:border-accent hover:bg-accent/5 w-28 min-w-28 md:w-32 md:min-w-32 flex-shrink-0"
                    >
                      <IconByName
                        name={
                          typeof amenity === 'string'
                            ? 'CheckCircle'
                            : amenity.iconName || 'CheckCircle'
                        }
                        className="size-5 md:size-6 text-primary"
                      />
                      <span className="text-xs md:text-sm font-medium text-primary leading-tight">
                        {typeof amenity === 'string' ? amenity : amenity.name || 'Unknown Amenity'}
                      </span>
                    </div>
                  ))}
                </Marquee>
                <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
                <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
              </div>
            </div>
          )}

          {/* Food Menu */}
          {property.foodMenu?.menu?.description && (
            <div className="mx-auto max-w-6xl px-1">
              <div className="rounded-lg p-6 flex flex-col items-center justify-center">
                <div className="mb-4">
                  <h3 className="flex items-center gap-2 text-3xl font-semibold text-primary mb-4 justify-center">
                    Food <span className="text-accent">Menu</span>
                  </h3>
                  <p className="text-muted-foreground">Delicious meals prepared fresh daily</p>
                  {property.foodMenu.price && (
                    <p className="block text-accent font-medium mt-1 text-center">
                      Monthly Food Charge: ₹{property.foodMenu.price.toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  <RichText
                    data={property.foodMenu.menu.description}
                    enableGutter={false}
                    enableProse={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Nearby Locations */}
          {property.nearby && property.nearby.length > 0 && (
            <PropertySection>
              <PropertySectionTitle className="text-center">
                Nearby <span className="text-accent">Locations</span>
              </PropertySectionTitle>
              <PropertySectionDescription className="text-center">
                Convenient access to key locations
              </PropertySectionDescription>
              <PropertySectionContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  {property.nearby.map((l, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-accent/35 bg-card p-3 md:px-8 text-sm flex flex-col items-center text-center"
                    >
                      <div className="font-medium">{l.name}</div>
                      <div className="text-muted-foreground">{l.distance}</div>
                    </div>
                  ))}
                </div>
              </PropertySectionContent>
            </PropertySection>
          )}

          {/* Property Overview Stats */}
          <div className="rounded-lg p-6 mx-auto max-w-6xl px-1">
            <div className="mb-4">
              <h3 className="flex items-center gap-2 text-3xl font-semibold text-primary justify-center mb-4">
                Property <span className="text-accent">Overview</span>
              </h3>
            </div>
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.rooms && property.rooms.length > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{property.rooms.length}</div>
                    <div className="text-sm text-muted-foreground">Total Rooms</div>
                  </div>
                )}
                {property.rooms && property.rooms.length > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
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
            </div>
          </div>
        </div>

        {/* Room Types - Full Width Below */}
        {property.rooms && property.rooms.length > 0 && (
          <div className="mt-12">
            <div className="rounded-lg p-6">
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-3xl font-semibold text-primary mb-4 justify-center">
                  Room Types & <span className="text-accent">Pricing</span>
                </h3>
                <p className="text-muted-foreground text-center">
                  Explore our comfortable living spaces designed for modern lifestyles
                </p>
              </div>
              <div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {property.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="rounded-lg border border-primary/20 bg-card hover:shadow-md transition-shadow p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{room.name}</h4>
                        {room.available !== false ? (
                          <Badge
                            variant="default"
                            className="bg-accent/10 text-accent border-accent/20"
                          >
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
