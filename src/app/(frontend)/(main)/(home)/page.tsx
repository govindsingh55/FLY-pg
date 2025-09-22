import HomePageSelector from '@/components/home/HomePageSelector'

// Enable ISR for the home page
export const revalidate = 60

export default function HomePage() {
  return <HomePageSelector />
}
