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
  accent?: 'sage' | 'plum' | 'rust' | 'taupe' | 'cream' | 'inky'
}

export const features: FeatureTile[] = [
  {
    id: 'find-easy',
    title: 'Find Easy',
    subtitle: 'Hassle-free Discovery',
    description:
      'Discover curated coliving stays across top cities with seamless booking, transparent pricing, and verified properties that match your lifestyle.',
    ctaLabel: 'Explore Properties',
    ctaHref: '#properties',
    variant: 'large',
    imageUrl: 'https://picsum.photos/seed/find-easy/800/600',
    accent: 'sage',
  },
  {
    id: 'stay-easy',
    title: 'Stay Easy',
    subtitle: 'Premium Comfort',
    description:
      'Move-in ready rooms designed for modern living with premium amenities, thoughtful details, and everything you need for a comfortable stay.',
    ctaLabel: 'See Rooms',
    ctaHref: '#properties',
    variant: 'standard',
    imageUrl: 'https://picsum.photos/seed/stay-easy/600/400',
    accent: 'plum',
  },
  {
    id: 'bond-easy',
    title: 'Bond Easy',
    subtitle: 'Vibrant Community',
    description:
      'Connect with like-minded people through curated events, shared experiences, and community spaces that foster lasting friendships.',
    ctaLabel: 'Join Community',
    ctaHref: '#community',
    variant: 'standard',
    imageUrl: 'https://picsum.photos/seed/bond-easy/600/400',
    accent: 'rust',
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
    imageUrl: 'https://picsum.photos/seed/cedar-heights/800/600',
    badges: ['New', 'Popular'],
    rating: 4.6,
    priceFrom: 10999,
  },
  {
    id: 'p2',
    name: 'Plum Court',
    area: 'Powai',
    city: 'Mumbai',
    imageUrl: 'https://picsum.photos/seed/plum-court/800/600',
    badges: ['Women Only'],
    rating: 4.5,
    priceFrom: 13999,
  },
  {
    id: 'p3',
    name: 'Sage Grove',
    area: 'Kondapur',
    city: 'Hyderabad',
    imageUrl: 'https://picsum.photos/seed/sage-grove/800/600',
    badges: ['Budget'],
    rating: 4.2,
    priceFrom: 8999,
  },
  {
    id: 'p4',
    name: 'Inky House',
    area: 'Indiranagar',
    city: 'Bengaluru',
    imageUrl: 'https://picsum.photos/seed/inky-house/800/600',
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
    imageUrl:
      'https://fastly.picsum.photos/id/996/220/80.jpg?hmac=XxxBAfdvVAnTVc0G3bPuocAPCVMeEYwJRBlSpoB43uE',
    href: '#',
  },
  {
    id: 'press2',
    name: 'Economic Times',
    imageUrl: 'https://picsum.photos/seed/economic-times/220/80',
    href: '#',
  },
  {
    id: 'press3',
    name: 'YourStory',
    imageUrl: 'https://picsum.photos/seed/yourstory/220/80',
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
    imageUrl: 'https://picsum.photos/seed/intern-pg/600/400',
    title: 'Intern PG',
    badge: 'New',
  },
  {
    id: 'g2',
    imageUrl: 'https://picsum.photos/seed/events/600/400',
    title: 'Events',
    badge: 'Happening',
  },
  {
    id: 'g3',
    imageUrl: 'https://picsum.photos/seed/community/600/400',
    title: 'Community',
  },
  {
    id: 'g4',
    imageUrl: 'https://picsum.photos/seed/announcements/600/400',
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
  qrImageUrl: 'https://picsum.photos/seed/qr-code/120/120',
  appImages: ['https://picsum.photos/seed/app-phone/400/600'],
  ctas: [
    { label: 'App Store', href: '#' },
    { label: 'Google Play', href: '#' },
  ],
}
