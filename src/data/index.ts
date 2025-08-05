export * from './amenities'

export type Location = {
  id: string
  name: string
  state?: string
  slug: string
}

export const locations: Location[] = [
  { id: 'blr', name: 'Bengaluru', state: 'Karnataka', slug: 'bengaluru' },
  { id: 'mum', name: 'Mumbai', state: 'Maharashtra', slug: 'mumbai' },
  { id: 'del', name: 'Delhi', state: 'Delhi', slug: 'delhi' },
  { id: 'hyd', name: 'Hyderabad', state: 'Telangana', slug: 'hyderabad' },
  { id: 'chn', name: 'Chennai', state: 'Tamil Nadu', slug: 'chennai' },
]

export type FeatureTile = {
  id: string
  title: string
  subtitle?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  variant: 'large' | 'tall' | 'wide' | 'standard'
  imageUrl: string
  accent?: 'peach' | 'pink' | 'mint' | 'blue'
}

export const features: FeatureTile[] = [
  {
    id: 'find-easy',
    title: 'Find Easy',
    subtitle: 'Hassle-free stays',
    description: 'Discover curated coliving stays across top cities.',
    ctaLabel: 'Explore',
    ctaHref: '#properties',
    variant: 'large',
    imageUrl:
      'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=1000&auto=format&fit=crop',
    accent: 'peach',
  },
  {
    id: 'stay-easy',
    title: 'Stay Easy',
    subtitle: 'Comfort first',
    description: 'Move-in ready rooms designed for comfort.',
    ctaLabel: 'See Rooms',
    ctaHref: '#properties',
    variant: 'standard',
    imageUrl:
      'https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=900&auto=format&fit=crop',
    accent: 'pink',
  },
  {
    id: 'bond-easy',
    title: 'Bond Easy',
    subtitle: 'Vibrant community',
    description: 'Make friends and memories that last.',
    ctaLabel: 'Join',
    ctaHref: '#community',
    variant: 'standard',
    imageUrl:
      'https://images.unsplash.com/photo-1520975922284-7b683c72e22d?q=80&w=900&auto=format&fit=crop',
    accent: 'mint',
  },
]

export type Stat = {
  id: string
  value: string
  label: string
  sublabel?: string
}

export const stats: Stat[] = [
  { id: 'residents', value: '50k+', label: 'Happy Residents' },
  { id: 'properties', value: '450+', label: 'Properties' },
  { id: 'cities', value: '10+', label: 'Cities' },
]

export type Property = {
  id: string
  name: string
  area: string
  city?: string
  imageUrl: string
  badges?: string[]
  rating?: number
  priceFrom?: number
}

export const properties: Property[] = [
  {
    id: 'p1',
    name: 'Cedar Heights',
    area: 'HSR Layout',
    city: 'Bengaluru',
    imageUrl:
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1200&auto=format&fit=crop',
    badges: ['New', 'Popular'],
    rating: 4.6,
    priceFrom: 10999,
  },
  {
    id: 'p2',
    name: 'Plum Court',
    area: 'Powai',
    city: 'Mumbai',
    imageUrl:
      'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1200&auto=format&fit=crop',
    badges: ['Women Only'],
    rating: 4.5,
    priceFrom: 13999,
  },
  {
    id: 'p3',
    name: 'Sage Grove',
    area: 'Kondapur',
    city: 'Hyderabad',
    imageUrl:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop',
    badges: ['Budget'],
    rating: 4.2,
    priceFrom: 8999,
  },
  {
    id: 'p4',
    name: 'Inky House',
    area: 'Indiranagar',
    city: 'Bengaluru',
    imageUrl:
      'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d8d?q=80&w=1200&auto=format&fit=crop',
    badges: ['Pet Friendly'],
    rating: 4.8,
    priceFrom: 15999,
  },
]

export type Testimonial = {
  id: string
  name: string
  text: string
  role?: string
  tag?: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Karthik Goel',
    text: 'Best coliving experience. Great food and friendly community.',
    role: 'Product Manager',
    tag: 'Long-term Stay',
  },
  {
    id: 't2',
    name: 'Ester Mathew',
    text: 'Safe and well maintained. Loved the events!',
    role: 'Designer',
    tag: 'Women Only',
  },
  {
    id: 't3',
    name: 'Rahul Pandey',
    text: 'Affordable and convenient for remote work.',
    role: 'Engineer',
    tag: 'Budget',
  },
]

export type PressLogo = {
  id: string
  name: string
  imageUrl: string
  href?: string
}

export const press: PressLogo[] = [
  {
    id: 'press1',
    name: 'BW Hotelier',
    imageUrl: 'https://placehold.co/220x80/png?text=BW+HOTELIER',
    href: '#',
  },
  {
    id: 'press2',
    name: 'Economic Times',
    imageUrl: 'https://placehold.co/220x80/png?text=ECONOMIC+TIMES',
    href: '#',
  },
  {
    id: 'press3',
    name: 'YourStory',
    imageUrl: 'https://placehold.co/220x80/png?text=YOURSTORY',
    href: '#',
  },
]

export type GalleryItem = {
  id: string
  imageUrl: string
  title?: string
  badge?: string
}

export const gallery: GalleryItem[] = [
  {
    id: 'g1',
    imageUrl:
      'https://images.unsplash.com/photo-1534082753658-1dcb40af0b1c?q=80&w=800&auto=format&fit=crop',
    title: 'Intern PG',
    badge: 'New',
  },
  {
    id: 'g2',
    imageUrl:
      'https://images.unsplash.com/photo-1582582429416-0a3b9b28c0b9?q=80&w=800&auto=format&fit=crop',
    title: 'Events',
    badge: 'Happening',
  },
  {
    id: 'g3',
    imageUrl:
      'https://images.unsplash.com/photo-1519710884009-87b1600c2df4?q=80&w=800&auto=format&fit=crop',
    title: 'Community',
  },
  {
    id: 'g4',
    imageUrl:
      'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=800&auto=format&fit=crop',
    title: 'Announcements',
  },
]

export type AppPromo = {
  id: string
  title: string
  description: string
  qrImageUrl: string
  appImages: string[]
  ctas: { label: string; href: string }[]
}

export const appPromo: AppPromo = {
  id: 'promo',
  title: 'Install The App for Personalised Offers!',
  description: 'Scan the QR to download the app and get offers tailored to your preferences.',
  qrImageUrl: 'https://placehold.co/120x120/png?text=QR',
  appImages: [
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=500&auto=format&fit=crop',
  ],
  ctas: [
    { label: 'App Store', href: '#' },
    { label: 'Google Play', href: '#' },
  ],
}
