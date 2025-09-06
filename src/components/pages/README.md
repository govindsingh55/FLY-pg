# Pages Collection Implementation

This directory contains the implementation of the PayloadCMS Pages collection for dynamic page creation.

## Overview

The Pages collection allows users to create dynamic website pages through the PayloadCMS admin interface while preserving all existing manually created pages.

## Features

- **Protected Routes**: Existing manual pages are protected and cannot be overridden
- **Tabbed Interface**: Clean, organized admin interface with three logical tabs
- **Live Preview**: Real-time preview of pages while editing with responsive breakpoints
- **Layout Builder**: Drag-and-drop page builder using existing marketing components
- **Theme Integration**: Full integration with the existing design system
- **Advanced SEO Management**: Comprehensive SEO fields including social media optimization
- **Draft System**: Draft and preview functionality
- **Responsive Design**: All components are mobile-first and responsive

## File Structure

```
src/components/pages/
├── PageRenderer.tsx          # Main page renderer component
├── BlockRenderer.tsx         # Renders individual layout blocks
├── blocks/                   # Individual block components
│   ├── HeroSection.tsx      # Hero section block
│   ├── FeaturesSection.tsx  # Features section block
│   ├── ContactSection.tsx   # Contact/CTA section block
│   ├── StatsSection.tsx     # Statistics section block
│   ├── ContentSection.tsx   # Rich text content block
│   └── MediaSection.tsx     # Media gallery block
└── README.md                # This file

src/app/
├── [...slug]/page.tsx       # Dynamic page routing
├── preview/page.tsx         # Live preview page
└── api/
    ├── draft/route.ts       # Draft preview API
    └── live-preview/route.ts # Live preview API
```

## Block Types

### Hero Block
- Title, subtitle, and badges
- Price and location information
- Call-to-action buttons
- Background image support
- Multiple variants (default, minimal, overlay)

### Features Block
- Configurable grid layout (2, 3, or 4 columns)
- Icon and image support
- Multiple variants (default, cards, minimal, accent)

### Contact Block
- Multiple action buttons
- Contact information display
- Various styling variants
- Icon support for buttons

### Stats Block
- Statistics display
- Animation support
- Multiple layout variants
- Flexible styling options

### Content Block
- Rich text content
- Multiple layout variants
- Custom styling options
- Responsive typography

### Media Block
- Image galleries
- Multiple layouts (grid, carousel, masonry, single)
- Lightbox support
- Caption and alt text support

## Usage

### Creating Pages

1. Go to PayloadCMS admin (`/admin`)
2. Navigate to "Pages" collection
3. Click "Create New"
4. **General Tab**: Fill in basic information (title, slug, status, theme settings)
5. **Content Tab**: Add layout blocks using the block builder
6. **SEO Tab**: Configure comprehensive SEO settings including social media optimization
7. **Live Preview**: Use the preview panel to see real-time changes across different device sizes
8. Save as draft or publish

### Live Preview Features

- **Real-time Updates**: See changes instantly as you edit
- **Responsive Breakpoints**: Preview on Mobile (375px), Tablet (768px), and Desktop (1440px)
- **Draft Preview**: Preview draft pages with a clear "Draft Preview" indicator
- **Published Preview**: Preview published pages as they appear to users
- **Full Functionality**: All page components and styling work in preview mode

### Tab Structure

#### **General Tab**
- **Title**: Page title (used for SEO and page heading)
- **Slug**: URL slug (validated against protected routes)
- **Status**: Draft or Published
- **Theme Settings**: Color scheme and background variant selection

#### **Content Tab**
- **Page Layout**: Drag-and-drop block builder with 6 block types
  - Hero Section
  - Features Section
  - Contact Section
  - Stats Section
  - Content Section
  - Media Section

#### **SEO Tab**
- **Basic SEO**: Meta title, description, keywords
- **Open Graph**: Custom OG title, description, and image
- **Twitter Cards**: Twitter-specific sharing optimization
- **Technical SEO**: Canonical URL, robots meta directives
- **Robots Control**: Fine-grained control over search engine behavior

### Route Protection

The system automatically protects existing routes:
- `/dashboard/*` - Dashboard pages
- `/auth/*` - Authentication pages
- `/admin/*` - Admin pages
- `/properties/*` - Property pages
- `/payments/*` - Payment pages
- `/api/*` - API routes

### Dynamic Routing

Pages are accessible at their slug URL:
- Page with slug "about-us" → `/about-us`
- Page with slug "contact" → `/contact`
- Page with slug "services/web-design" → `/services/web-design`

## Theme Integration

All blocks support the existing theme system:
- **Color Schemes**: Default, Secondary, Accent, Plum, Sage, Rust, Taupe, Cream, Inky
- **Background Variants**: Default, Gradient, Minimal
- **Component Variants**: Multiple styling options for each block type

## SEO Features

Each page includes comprehensive SEO optimization:
- **Basic SEO**: Custom meta title, description, keywords
- **Open Graph**: Custom OG title, description, and image for social media sharing
- **Twitter Cards**: Twitter-specific sharing optimization with card type selection
- **Technical SEO**: Canonical URL specification
- **Robots Control**: Fine-grained control over search engine indexing and crawling
- **Automatic Fallbacks**: Smart defaults when custom values are not provided

## Development Notes

- TypeScript types are temporarily using `any` until PayloadCMS types are regenerated
- Run `npm run payload generate:types` after adding the Pages collection to regenerate types
- All components are fully typed and follow the existing code patterns
- The system is designed to be extensible - new blocks can be easily added

## Future Enhancements

- Lightbox functionality for media blocks
- Carousel implementation for media blocks
- Advanced animation options
- More block types (testimonials, pricing, etc.)
- Page templates
- Nested pages support
