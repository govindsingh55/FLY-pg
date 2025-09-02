# Payload Custom Components

This directory contains custom components for the Payload CMS admin interface.

## Components

### CollapsibleJsonField

A custom field component that displays JSON data in a collapsible format, showing only a few lines by default and allowing expansion to view the full content.

**Usage:**
```typescript
// In a collection field definition
{
  name: 'jsonData',
  type: 'json',
  admin: {
    components: {
      Field: '@/payload/components/CollapsibleJsonField',
    },
  },
}
```

**Features:**
- Shows limited lines by default (better for admin interface)
- Expandable/collapsible view
- Professional styling with CSS
- Dark theme support
- Responsive design

**Applied to:**
- `Payments.bookingSnapshot` - Booking data snapshot
- `Payments.phonepeLastRaw` - PhonePe API response data
- `Bookings.roomSnapshot` - Room data snapshot
- `VisitBookings.guestUser` - Guest user information

### PhonePeTools

Admin tools for managing PhonePe payments, including status checking and manual status updates.

**Features:**
- Recheck payment status
- View raw status JSON
- Mark payments as completed/failed
- Real-time status updates

## Styling

Components use CSS files for styling and support both light and dark themes using Payload's CSS variables.

## Current Status

The CollapsibleJsonField component is now functional and demonstrates:
- ✅ Field labels with required indicators
- ✅ JSON data preview (first 3 lines)
- ✅ Expandable/collapsible functionality
- ✅ Professional styling with CSS
- ✅ Dark theme support

## Future Enhancements

The component can be enhanced to:
- 🔄 Integrate properly with Payload's field system to show actual data
- 🔄 Add syntax highlighting for JSON
- 🔄 Support configurable preview line counts
- 🔄 Add copy-to-clipboard functionality
- 🔄 Handle real-time data updates
