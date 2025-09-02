# Amenities System

This directory contains components and utilities for managing and displaying amenities dynamically from the Payload CMS collection.

## Components

### AmenityDisplay
A flexible component for displaying individual amenities with different variants.

```tsx
import { AmenityDisplay } from '@/components/ui/AmenityDisplay'

// Basic usage
<AmenityDisplay amenity={amenity} />

// With description
<AmenityDisplay amenity={amenity} showDescription variant="detailed" />

// Compact variant
<AmenityDisplay amenity={amenity} variant="compact" />
```

**Props:**
- `amenity`: Amenity object from the collection
- `showDescription`: Whether to show the description
- `showIcon`: Whether to show the icon
- `variant`: 'default' | 'compact' | 'detailed'
- `className`: Additional CSS classes
- `iconClassName`, `nameClassName`, `descriptionClassName`: Style specific elements

### AmenityList
Displays a list of amenities vertically.

```tsx
import { AmenityList } from '@/components/ui/AmenityList'

<AmenityList 
  amenities={amenities} 
  variant="compact" 
  maxItems={5} 
/>
```

### AmenityGrid
Displays amenities in a responsive grid layout.

```tsx
import { AmenityGrid } from '@/components/ui/AmenityGrid'

<AmenityGrid 
  amenities={amenities} 
  columns={3} 
  showDescription 
  variant="detailed" 
/>
```

### AmenityCategoryGrid
**Note: This component has been removed since the Amenities collection doesn't have a category field.**

If you need category grouping functionality, you'll need to add a `category` field to the Amenities collection first.

## Hooks

### useAmenities
Hook for managing amenities state across the application.

```tsx
import { useAmenities } from '@/hooks/useAmenities'

const { amenities, loading, error, refresh } = useAmenities()
```

### useAmenitiesByCategory
**Note: This hook has been removed since the Amenities collection doesn't have a category field.**

If you need category filtering functionality, you'll need to add a `category` field to the Amenities collection first.

## Utilities

### fetchAmenities
**Note: This utility function has been removed. Amenities are now fetched directly in the useAmenities hook.**

The `useAmenities` hook now handles API calls directly to `/api/amenities`.

## Amenity Object Structure

```tsx
interface Amenity {
  id: string
  name: string
  description?: string
  logo?: Media // Upload field relation
  image?: Media // Upload field relation
  status: 'active' | 'draft' | 'deleted'
  iconName?: string // Fallback Lucide icon name
  // Note: category and sortOrder fields are not currently available
  // Add them to the Amenities collection if needed
}
```

## Migration from Static Data

The system has been migrated from static amenities in `src/data/amenities.ts` to dynamic data from the Payload CMS collection.

**Old way (static):**
```tsx
import { amenities } from '@/data/amenities'

{amenities.map(amenity => (
  <div key={amenity.id}>{amenity.label}</div>
))}
```

**New way (dynamic):**
```tsx
import { useAmenities } from '@/hooks/useAmenities'

const { amenities } = useAmenities()

{amenities.map(amenity => (
  <AmenityDisplay key={amenity.id} amenity={amenity} />
))}
```

## Admin Management

Amenities can be managed through the Payload CMS admin panel at `/admin/amenities`. Admins and managers can:

- Create new amenities
- Edit existing amenities
- Upload logos and images
- Set status (active/draft/deleted)
- Categorize amenities
- Set sort order for display

## Seeding

Initial amenities data is seeded using the seed function in `src/endpoints/seed/amenities.ts`. Run the seed command to populate the collection with default amenities.
