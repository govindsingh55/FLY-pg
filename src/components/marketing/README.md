# Marketing Components

This directory contains reusable marketing components designed for both single-property and multi-property landing pages.

## Components Overview

### HeroSection
A flexible hero section component with support for:
- Background images with overlay
- Badges/tags
- Title and subtitle
- Price and location information
- Multiple call-to-action buttons
- Scroll indicator

**Props:**
```typescript
interface HeroSectionProps {
  title: string
  subtitle?: string
  badges?: Array<{ text: string; variant?: 'default' | 'secondary' | 'outline' }>
  priceInfo?: { label: string; amount: string; period?: string }
  locationInfo?: { label: string; text: string }
  primaryCta?: { label: string; icon?: keyof typeof Lucide; onClick?: () => void }
  secondaryCta?: { label: string; icon?: keyof typeof Lucide; onClick?: () => void }
  backgroundImage?: string
  showScrollIndicator?: boolean
  className?: string
}
```

### FeaturesSection
A features showcase component with:
- Configurable grid layout (2, 3, or 4 columns)
- Icon support with accent colors
- Hover animations
- Responsive design

**Props:**
```typescript
interface FeaturesSectionProps {
  title: string
  subtitle?: string
  features: Feature[]
  columns?: 2 | 3 | 4
  className?: string
}
```

### PropertyDetailsSection
A comprehensive property details component that displays:
- Property gallery
- About section
- Amenities
- Food menu
- Nearby locations
- Room types
- Sticky booking card

**Props:**
```typescript
interface PropertyDetailsSectionProps {
  property: PropertyData
  bookingCard?: React.ReactNode
  className?: string
}
```

### ContactCTASection
A call-to-action section with:
- Multiple button variants
- Icon support
- Different color schemes
- Responsive layout

**Props:**
```typescript
interface ContactCTASectionProps {
  title: string
  description?: string
  actions: CTAAction[]
  variant?: 'primary' | 'secondary' | 'gradient'
  className?: string
}
```

### StatsSection
A statistics display component with:
- Multiple layout variants
- Floating overlay option
- Minimal styling option
- Responsive grid

**Props:**
```typescript
interface StatsSectionProps {
  stats: Stat[]
  variant?: 'default' | 'floating' | 'minimal'
  className?: string
}
```

## Usage Examples

### Single Property Home Page
```tsx
import HeroSection from '@/components/marketing/HeroSection'
import FeaturesSection from '@/components/marketing/FeaturesSection'
import PropertyDetailsSection from '@/components/marketing/PropertyDetailsSection'
import ContactCTASection from '@/components/marketing/ContactCTASection'
import StatsSection from '@/components/marketing/StatsSection'

// Hero with property-specific data
<HeroSection
  title={property.name}
  subtitle={property.tagline}
  badges={[
    { text: property.genderType, variant: 'secondary' },
    { text: `${availableRooms} Rooms Available`, variant: 'default' }
  ]}
  priceInfo={{
    label: 'Starting from',
    amount: `₹${minRent.toLocaleString()}`,
    period: '/month'
  }}
  primaryCta={{ label: 'Schedule Visit', icon: 'Calendar' }}
  backgroundImage={property.images[0]?.url}
/>

// Floating stats overlay
<StatsSection stats={stats} variant="floating" />

// Property features
<FeaturesSection
  title={`Why Choose ${property.name}?`}
  features={propertyFeatures}
  columns={3}
/>

// Property details with booking card
<PropertyDetailsSection
  property={property}
  bookingCard={<BookingCard rooms={property.rooms} />}
/>
```

### Multi Property Home Page
```tsx
// General features for the platform
<FeaturesSection
  title="Why Choose FLY?"
  subtitle="Experience the perfect blend of comfort, community, and convenience."
  features={platformFeatures}
  columns={3}
/>

// Contact CTA for multi-property context
<ContactCTASection
  title="Ready to Find Your Perfect Home?"
  actions={[
    { label: 'Explore Properties', icon: 'Search', variant: 'default' },
    { label: 'Contact Us', icon: 'MessageCircle', variant: 'outline' }
  ]}
  variant="primary"
/>
```

## Design System

### Color Variants
- **Primary**: Brand primary color with white text
- **Secondary**: Secondary color scheme
- **Gradient**: Primary color gradient

### Button Variants
- **Default**: Solid background
- **Secondary**: Semi-transparent background
- **Outline**: Bordered with transparent background

### Layout Variants
- **Default**: Standard section layout
- **Floating**: Overlay positioning with negative margin
- **Minimal**: Clean, minimal styling

## Best Practices

1. **Consistent Spacing**: Use the predefined padding classes (`py-16`, `px-6`)
2. **Responsive Design**: All components are mobile-first and responsive
3. **Accessibility**: Include proper alt text for images and semantic HTML
4. **Performance**: Use proper image optimization and lazy loading
5. **Type Safety**: All components are fully typed with TypeScript

## Customization

Components can be customized through:
- **Props**: Pass different data and configuration
- **CSS Classes**: Use the `className` prop for additional styling
- **Variants**: Choose from predefined design variants
- **Composition**: Combine components in different ways

## File Structure
```
src/components/marketing/
├── HeroSection.tsx
├── FeaturesSection.tsx
├── PropertyDetailsSection.tsx
├── ContactCTASection.tsx
├── StatsSection.tsx
├── README.md
└── [existing components]/
```
