# Premium Unified Theme Documentation

## Overview

The application features a **sophisticated, unified color palette** that harmoniously combines all the earthy, warm tones into one cohesive design system.

## Color Philosophy

This theme creates a **warm, inviting, and professional** atmosphere by combining:

- **Warm cream** base for comfort and readability
- **Forest green** for trust and nature
- **Muted ochre/gold** for warmth and premium feel
- **Supporting colors** (sage, rust, plum, blue) for variety and depth

## Color Palette

### Light Mode

| Element         | Color          | Hex       | Usage                    |
| --------------- | -------------- | --------- | ------------------------ |
| **Background**  | Warm Cream     | `#faf8f5` | Page background          |
| **Foreground**  | Deep Forest    | `#1a2419` | Primary text             |
| **Card**        | Pure White     | `#ffffff` | Card surfaces            |
| **Primary**     | Forest Green   | `#2c3e33` | Buttons, links, emphasis |
| **Secondary**   | Sage Green     | `#7a8870` | Secondary actions        |
| **Accent**      | Muted Ochre    | `#d4a850` | Highlights, badges       |
| **Destructive** | Rust           | `#a05438` | Errors, delete actions   |
| **Border**      | Mushroom Taupe | `#e0d9d0` | Borders, dividers        |

### Dark Mode

| Element         | Color        | Hex       | Usage                    |
| --------------- | ------------ | --------- | ------------------------ |
| **Background**  | Deep Forest  | `#1c1e1a` | Page background          |
| **Foreground**  | Warm Cream   | `#f5f3f0` | Primary text             |
| **Card**        | Forest Shade | `#262a24` | Card surfaces            |
| **Primary**     | Bright Ochre | `#e5bd6a` | Buttons, links, emphasis |
| **Secondary**   | Light Sage   | `#8a9b7c` | Secondary actions        |
| **Accent**      | Warm Rust    | `#c97958` | Highlights, badges       |
| **Destructive** | Bright Rust  | `#d47656` | Errors, delete actions   |
| **Border**      | Olive Gray   | `#3a3f36` | Borders, dividers        |

## Extended Palette

The theme includes **9 carefully selected colors** from the original palette, each serving specific purposes:

```css
--color-forest: #2c3e33; /* Primary, trust, stability */
--color-plum: #4a3440; /* Subtle accents, charts */
--color-inky-blue: #344146; /* Info states, secondary text */
--color-sage: #7a8870; /* Success states, calm actions */
--color-rust: #a05438; /* Warnings, warm accents */
--color-ochre: #d4a850; /* Premium highlights, CTAs */
--color-mushroom: #948570; /* Muted backgrounds */
--color-cream: #f0ede7; /* Light surfaces */
--color-deep-blue: #2f3e4e; /* Professional accents */
```

## Semantic Colors

### Success, Info, Warning

- **Success**: Sage Green (calming, positive)
- **Info**: Deep Blue (professional, informative)
- **Warning**: Ochre (attention-grabbing, warm)
- **Destructive**: Rust (clear danger indicator)

### Chart Colors

For data visualization, the theme provides 5 harmonious chart colors:

1. Forest Green
2. Muted Ochre
3. Rust
4. Sage Green
5. Plum

## Usage Examples

### Tailwind CSS Classes

```html
<!-- Primary Button -->
<button class="bg-primary text-primary-foreground">Book Now</button>

<!-- Card with Accent Border -->
<div class="rounded-lg border-2 border-accent bg-card p-6">Content</div>

<!-- Success Badge -->
<span class="rounded bg-success px-2 py-1 text-success-foreground"> Available </span>

<!-- Gradient Background -->
<div class="bg-gradient-forest-ochre p-8 text-white">Premium Section</div>

<!-- Glass Effect (Glassmorphism) -->
<div class="glass rounded-lg p-4">Overlay Content</div>
```

### Custom Utility Classes

The theme includes built-in gradient utilities:

```html
<!-- Gradient Backgrounds -->
<div class="bg-gradient-forest-ochre">...</div>
<div class="bg-gradient-sage-cream">...</div>
<div class="bg-gradient-rust-ochre">...</div>

<!-- Text Gradient -->
<h1 class="text-gradient-primary">Premium Title</h1>

<!-- Glassmorphism -->
<div class="glass">Frosted glass effect</div>
```

## Design Principles

### 1. **Hierarchy Through Color**

- **Primary actions**: Forest green (light) / Ochre (dark)
- **Secondary actions**: Sage green
- **Accents**: Ochre/gold tones
- **Warnings**: Rust tones

### 2. **Accessibility**

- All color combinations meet **WCAG AA** standards minimum
- Dark mode inverts appropriately for readability
- Focus rings use high-contrast colors

### 3. **Warmth & Premium Feel**

- Cream base creates warmth and comfort
- Gold/ochre accents convey premium quality
- Forest green provides trust and stability

### 4. **Natural & Earthy**

- Color palette inspired by nature
- Creates calming, organic atmosphere
- Suitable for hospitality and real estate

## Common UI Patterns

### Hero Sections with Image Overlays

For hero sections with background images, use strong gradients to ensure content readability:

```html
<!-- Recommended: Strong gradient overlay -->
<div class="relative">
	<img src="hero.jpg" class="h-full w-full object-cover" />
	<div
		class="absolute inset-0 bg-linear-to-t from-background/95 via-background/70 to-background/20"
	></div>
	<!-- Content here will be readable -->
</div>
```

**Best Practices for Hero Sections:**

1. **Minimum height**: `min-h-[450px]` for mobile, `lg:min-h-[500px]` for desktop
2. **Gradient opacity**: Use `from-background/95` (95% opacity) at bottom for text contrast
3. **Padding**: `pb-8 lg:pb-12` for content at bottom
4. **Max width**: Constrain text content with `max-w-3xl` to prevent line length issues
5. **Button visibility**: Use `lg:shrink-0` on button containers to prevent wrapping issues

### Cards with Subtle Elevation

```html
<div class="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg">
	<!-- Card content -->
</div>
```

### Status Badges

```html
<!-- Success -->
<Badge class="border-success/20 bg-success/10 text-success">Available</Badge>

<!-- Warning -->
<Badge class="border-warning/20 bg-warning/10 text-warning">Limited</Badge>

<!-- Info -->
<Badge class="border-info/20 bg-info/10 text-info">New</Badge>
```

## Dark Mode

Dark mode automatically applies when the `.dark` class is present on the root element.

**Key Changes in Dark Mode:**

- Background becomes deep forest (`#1c1e1a`)
- Primary color shifts to bright ochre for visibility
- All colors are adjusted for proper contrast
- Warm tones are maintained for consistency

## Customization

### Adjusting Colors

Edit `src/routes/layout.css` to modify any color:

```css
:root {
	--primary: #your-new-color;
	/* Other variables... */
}

.dark {
	--primary: #your-dark-mode-color;
}
```

### Adding New Semantic Colors

```css
:root {
	--tertiary: #new-color;
	--tertiary-foreground: #text-color;
}

@theme inline {
	--color-tertiary: var(--tertiary);
	--color-tertiary-foreground: var(--tertiary-foreground);
}
```

### Creating Custom Gradients

Add custom gradient utilities in `layout.css`:

```css
@layer utilities {
	.bg-gradient-custom {
		background: linear-gradient(135deg, var(--color-your-start) 0%, var(--color-your-end) 100%);
	}
}
```

## Brand Guidelines

### When to Use Each Color

| Situation              | Color                  | Rationale                  |
| ---------------------- | ---------------------- | -------------------------- |
| Call-to-action buttons | Primary (Forest/Ochre) | Strong, trustworthy        |
| Success messages       | Sage Green             | Calm, positive             |
| Property highlights    | Accent (Ochre)         | Premium, valuable          |
| Warnings               | Rust                   | Warm but attention-getting |
| Errors/Delete          | Destructive (Rust)     | Clear danger signal        |
| Information            | Deep Blue              | Professional, neutral      |
| Secondary actions      | Secondary (Sage)       | Less emphasis              |

### Button Variants

```html
<!-- Primary CTA -->
<button variant="default">Book Now</button>

<!-- Secondary Action -->
<button variant="secondary">Learn More</button>

<!-- Subtle Action -->
<button variant="outline">View Details</button>

<!-- Ghost/Minimal -->
<button variant="ghost">Cancel</button>

<!-- Danger Action -->
<button variant="destructive">Delete</button>
```

## Best Practices

1. **Consistency**: Use the same color for the same type of action across the site
2. **Contrast**: Always ensure text meets minimum contrast ratios
   - **Minimum**: 4.5:1 for normal text
   - **Large text**: 3:1 for 18pt+ or 14pt+ bold
3. **Hierarchy**: Use color intensity to show importance (primary > secondary > muted)
4. **Restraint**: Don't use all colors on one page - choose 2-3 primary colors per view
5. **Context**: Consider the emotion - warm colors for booking, cool for information
6. **Spacing**: Use consistent padding (`p-4`, `p-6`, `p-8`) with the design system
7. **Gradients**: Use `bg-linear-to-*` classes (Tailwind 4 syntax) instead of `bg-gradient-to-*`

## Accessibility Compliance

All color combinations have been tested for:

- ✅ **WCAG AA** compliance (minimum 4.5:1 for normal text)
- ✅ **WCAG AAA** for large text (18pt+ or 14pt+ bold)
- ✅ Deuteranopia, Protanopia, and Tritanopia color blindness
- ✅ High contrast mode compatibility
- ✅ Custom scrollbar with proper contrast
- ✅ ::selection colors for better user experience

## Browser Support

The theme uses modern CSS features:

- CSS Custom Properties (CSS Variables)
- `oklch()` color space (with fallbacks)
- Native CSS nesting
- Backdrop filters for glass effects
- `bg-linear-to-*` gradient syntax (Tailwind CSS 4)

**Supported Browsers:**

- Chrome/Edge 88+
- Firefox 84+
- Safari 14+
- All modern mobile browsers

## Troubleshooting

**Colors look different than expected?**

- Check if dark mode is enabled
- Clear browser cache
- Verify no browser extensions are modifying colors

**Theme not applying?**

- Ensure you're on a route within the `(home)` group
- Check browser console for CSS errors
- Verify `layout.css` is being imported

**Need to adjust a specific color?**

- Use browser DevTools to inspect the element
- Find the CSS variable being used
- Override in your component's style or global CSS

**Buttons not visible in hero?**

- Ensure gradient overlay uses sufficient opacity (`from-background/95`)
- Add proper padding at bottom (`pb-8 lg:pb-12`)
- Use `lg:shrink-0` on button containers
- Set minimum heights (`min-h-[450px]`)

## Integration with Shadcn/UI

This theme is fully compatible with shadcn/ui components. All components will automatically use the theme colors through Tailwind's color system.

```tsx
import { Button } from '$lib/components/ui/button';

// Automatically uses theme colors
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

## Performance Tips

1. **CSS Variables**: Theme uses CSS variables for instant switching (no re-renders)
2. **Minimal Classes**: Use utility classes instead of custom CSS when possible
3. **Gradient Caching**: Gradients are defined once in CSS, not inline
4. **ScrollBar**: Custom scrollbar is hardware-accelerated
5. **Transitions**: Use `transition-all` sparingly, prefer specific properties

## Version History

- **v1.0** - Initial unified theme implementation
- **v1.1** - Added glassmorphism utilities
- **v1.2** - Enhanced hero section patterns with better overlay guidelines
- **v1.3** - Updated to Tailwind CSS 4 gradient syntax (`bg-linear-to-*`)
