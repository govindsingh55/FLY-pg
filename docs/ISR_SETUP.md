# ISR (Incremental Static Regeneration) Setup

This document explains the ISR implementation for the home page based on property collection changes.

## Overview

The home page now uses ISR to provide fast loading times while ensuring content is updated when properties are created, updated, or deleted.

## Components

### 1. Revalidation API Route
- **File**: `src/app/api/revalidate/route.ts`
- **Purpose**: Handles cache invalidation requests
- **Security**: Requires `REVALIDATION_SECRET` environment variable

### 2. Property Collection Hooks
- **File**: `src/payload/collections/Properties/hooks/revalidateHomePage.ts`
- **Purpose**: Automatically triggers revalidation when properties change
- **Triggers**: After create, update, or delete operations on published properties

### 3. Home Page Configuration
- **Files**: 
  - `src/app/(frontend)/(main)/(home)/page.tsx`
  - `src/components/home/HomePageSelector.tsx`
- **Settings**: 
  - `revalidate: 60` (1 minute)
  - `fetchCache: 'default-cache'`

## Environment Variables Required

Add these to your `.env` file:

```env
# Revalidation secret for cache invalidation
REVALIDATION_SECRET=your-secret-key-here

# Site URL for API calls (should match NEXT_PUBLIC_SITE_URL)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## How It Works

1. **Static Generation**: Home page is statically generated at build time
2. **ISR Revalidation**: Page revalidates every 60 seconds automatically
3. **On-Demand Revalidation**: Page revalidates immediately when:
   - A property is created
   - A property is updated
   - A property is deleted (if it was published)

## Benefits

- **Performance**: Static pages load faster than server-rendered pages
- **Fresh Content**: Content updates automatically when properties change
- **Reduced Server Load**: Cached pages reduce database queries
- **Better UX**: Users see content updates without manual refresh

## Testing ISR

1. **Build the application**: `npm run build`
2. **Start the application**: `npm start`
3. **Test revalidation**:
   - Create a new property in the admin panel
   - Update an existing property
   - Delete a property
   - Check that the home page updates within 60 seconds

## Manual Revalidation

You can manually trigger revalidation by calling the API:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"path": "/", "tag": "home-page", "secret": "your-secret-key"}'
```

## Monitoring

Check the console logs for revalidation messages:
- `[Properties] Revalidated home page after create/update/delete`
- `Revalidated path: /`
- `Revalidated tag: home-page`

## Troubleshooting

1. **Revalidation not working**: Check that `REVALIDATION_SECRET` is set
2. **Build errors**: Ensure all hooks are properly imported
3. **Cache not updating**: Verify the API route is accessible
4. **Performance issues**: Adjust the `revalidate` value (default: 60 seconds)
