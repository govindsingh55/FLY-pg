export type Amenity = {
  id: string
  label: string
  icon: string // lucide-react icon name
}

export const amenities: Amenity[] = [
  { id: 'wifi', label: 'High-speed Wi‑Fi', icon: 'Wifi' },
  { id: 'laundry', label: 'Laundry', icon: 'Shirt' },
  { id: 'meals', label: 'Meals', icon: 'Utensils' },
  { id: 'housekeeping', label: 'Housekeeping', icon: 'Broom' },
  { id: 'security', label: '24x7 Security', icon: 'ShieldCheck' },
  { id: 'ac', label: 'Air Conditioning', icon: 'Snowflake' },
  { id: 'parking', label: 'Parking', icon: 'ParkingCircle' },
  { id: 'gym', label: 'Gym', icon: 'Dumbbell' },
  { id: 'study', label: 'Study Area', icon: 'BookOpen' },
  { id: 'events', label: 'Community Events', icon: 'PartyPopper' },
]
