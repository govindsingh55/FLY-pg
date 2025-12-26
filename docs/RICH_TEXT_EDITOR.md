# Rich Text Editor Documentation

## Overview

This application uses **TipTap** as the rich text editor for property descriptions. TipTap is a headless, framework-agnostic editor that provides a flexible and extensible rich text editing experience.

## Why TipTap?

- ✅ **Excellent Svelte Support** via `svelte-tiptap` official wrapper
- ✅ **Dual Output Format** - Supports both JSON and HTML
- ✅ **TypeScript-First** - Full type safety
- ✅ **Modular** - Only include the features you need
- ✅ **Accessible** - Built with accessibility in mind
- ✅ **Theme Integration** - Easy to style with Tailwind CSS
- ✅ **Error-Resilient** - Graceful fallbacks with `svelte:boundary`

## Architecture

### Two Separate Components

#### 1. `RichTextEditor.svelte` (Admin Only - Write Mode)

- **Location**: `src/lib/components/editor/rich-text-editor.svelte`
- **Purpose**: Edit property descriptions in admin panel
- **Output**: JSON format (stored in database)
- **Features**: Toolbar, formatting controls, character count
- **Error Handling**: Falls back to plain textarea if TipTap fails

#### 2. `RichTextDisplay.svelte` (Public - Read Mode)

- **Location**: `src/lib/components/editor/rich-text-display.svelte`
- **Purpose**: Display formatted descriptions on public pages
- **Input**: JSON format from database
- **Output**: Styled HTML with Tailwind Typography
- **Error Handling**: Falls back to plain text if JSON parsing fails

> **Important**: These components are **completely separate** with no shared state or dependencies. The editor is optimized for editing, and the display is optimized for rendering.

## Storage Format

Property descriptions are stored as **JSON strings** in the database:

```json
{
	"type": "doc",
	"content": [
		{
			"type": "paragraph",
			"content": [
				{ "type": "text", "text": "This is a " },
				{ "type": "text", "marks": [{ "type": "bold" }], "text": "modern" },
				{ "type": "text", "text": " apartment" }
			]
		}
	]
}
```

**Benefits of JSON storage:**

- Structured, queryable data
- Consistent formatting across transformations
- Easy to convert to HTML when needed
- Version-proof for future migrations
- Smaller storage size than HTML

## Usage

### Using RichTextEditor (Admin)

```svelte
<script>
	import RichTextEditor from '$lib/components/editor/rich-text-editor.svelte';

	let description = $state('');

	function handleChange(jsonContent) {
		description = jsonContent;
		// Save to database
	}
</script>

<RichTextEditor
	value={description}
	onchange={handleChange}
	placeholder="Enter property description..."
	maxLength={5000}
/>

<!-- Hidden input for form submission -->
<input type="hidden" name="description" value={description} />
```

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | - | JSON content from database |
| `onchange` | `function` | Yes | - | Callback when content changes |
| `placeholder` | `string` | No | "Enter description..." | Placeholder text |
| `maxLength` | `number` | No | - | Character limit |

---

### Using RichTextDisplay (Public)

```svelte
<script>
	import RichTextDisplay from '$lib/components/editor/rich-text-display.svelte';

	let { property } = $props();
</script>

<div class="prose prose-sm max-w-none text-muted-foreground">
	<RichTextDisplay content={property.description} fallback="No description available." />
</div>
```

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `content` | `string \| null` | Yes | - | JSON content from database |
| `fallback` | `string` | No | "No description available." | Text shown when content is empty |

---

## Available Formatting

The editor supports the following formatting options:

### Text Formatting

- **Bold** - `Ctrl/Cmd + B`
- _Italic_ - `Ctrl/Cmd + I`
- ~~Strikethrough~~ - `Ctrl/Cmd + Shift + S`

### Headings

- Heading 2 (H2)
- Heading 3 (H3)

### Lists

- Bullet List
- Numbered List

### Links

- Insert/Edit hyperlinks
- Keyboard shortcut: `Ctrl/Cmd + K`

### Other

- Character count display
- Undo/Redo support
- Paste handling (strips unwanted formatting)

## Styling Integration

The editor and display components are fully integrated with the application theme:

### Editor Styling

- **Toolbar**: Uses theme's `primary` color for active buttons
- **Editor Border**: Matches form input borders (`border-input`)
- **Focus State**: Ring color matches `ring-primary`
- **Background**: Matches `bg-background`

### Display Styling

- Uses **Tailwind Typography** (`@tailwindcss/typography`)
- Custom prose styles applied via theme colors
- Headings use theme's font hierarchy
- Links use `text-primary` color
- Lists use proper indentation and markers

```css
/* Example prose customization */
.prose h2 {
	@apply font-bold text-foreground;
}

.prose a {
	@apply text-primary hover:underline;
}

.prose strong {
	@apply font-semibold text-foreground;
}
```

## Error Handling

Both components use **`<svelte:boundary>`** for graceful error recovery:

### Editor Error Fallback

If TipTap fails to initialize:

1. Component catches the error
2. Displays a plain `<Textarea>` instead
3. Shows error message: _"Rich text editor unavailable"_
4. User can still edit content (as plain text)
5. No data loss - content is preserved

### Display Error Fallback

If JSON parsing fails:

1. Component catches the error
2. Attempts to display as plain text
3. If that fails, shows fallback message
4. No broken UI - always displays something

## Backward Compatibility

The implementation maintains **full backward compatibility** with existing plain text descriptions:

### When Loading Old Data

- Plain text descriptions are detected automatically
- Wrapped in TipTap paragraph format on first edit
- No manual migration needed

### Example Transformation

```javascript
// Input (plain text from old records)
"This is a simple apartment description."

// Auto-wrapped in TipTap JSON on first edit
{
  "type": "doc",
  "content": [{
    "type": "paragraph",
    "content": [{"type": "text", "text": "This is a simple apartment description."}]
  }]
}
```

## Common Patterns

### Pattern 1: Loading Existing Content

```svelte
<script>
	let description = $state(property.description || '');

	// TipTap handles both JSON and plain text gracefully
</script>

<RichTextEditor value={description} onchange={(v) => (description = v)} />
```

### Pattern 2: Form Submission

```svelte
<form
	{...updateProperty.enhance(async ({ submit }) => {
		await submit();
		toast.success('Saved!');
	})}
>
	<RichTextEditor value={descriptionValue} onchange={(v) => (descriptionValue = v)} />
	<input type="hidden" name="description" value={descriptionValue} />
	<Button type="submit">Save</Button>
</form>
```

### Pattern 3: Conditional Display

```svelte
{#if property.description}
	<RichTextDisplay content={property.description} />
{:else}
	<p class="text-muted-foreground italic">No description provided.</p>
{/if}
```

## Troubleshooting

### Editor Not Loading

**Symptom**: Editor shows plain textarea immediately

**Possible Causes:**

1. TipTap dependencies not installed
2. JavaScript error in console
3. Browser compatibility issue

**Solution:**

```bash
# Reinstall dependencies
npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-link svelte-tiptap

# Check browser console for errors
# Ensure browser is modern (Chrome 88+, Firefox 84+, Safari 14+)
```

---

### Content Not Displaying

**Symptom**: Public page shows no description or error

**Possible Causes:**

1. Invalid JSON in database
2. Display component not imported
3. Missing Tailwind Typography plugin

**Solution:**

1. Check database value is valid JSON
2. Verify import: `import RichTextDisplay from '$lib/components/editor/rich-text-display.svelte'`
3. Install typography: `npm install @tailwindcss/typography`

---

### Formatting Lost on Save

**Symptom**: Content saves but formatting disappears

**Possible Causes:**

1. Not using hidden input for form submission
2. Form serialization stripping JSON

**Solution:**

```svelte
<!-- Ensure hidden input captures JSON -->
<input type="hidden" name="description" value={descriptionValue} />
```

---

### Character Count Issues

**Symptom**: Character count shows incorrect number

**Possible Causes:**

1. JSON structure counted instead of plain text
2. Extension not configured properly

**Solution:**

- TipTap's `CharacterCount` extension counts text content only, not JSON structure
- Verify extension is included in editor setup

## Performance Considerations

### Editor Performance

- **Lazy Loading**: Editor only loads when component mounts
- **Debouncing**: Character count updates are debounced
- **Memory**: Editor instance cleaned up on component destroy

### Display Performance

- **Static Generation**: JSON → HTML conversion happens once per render
- **No Re-computation**: Uses `$derived` for memoization
- **Small Bundle**: Display component only includes rendering logic

## Security Considerations

### XSS Protection

- TipTap sanitizes all user input
- HTML output is safe (no `<script>` tags allowed)
- Links are properly escaped

### Input Validation

- Maximum character limits enforced
- Only allowed formatting tags permitted
- No arbitrary HTML injection possible

## Testing

### Manual Testing Checklist

- [ ] Create new property with formatted description
- [ ] Edit existing property description
- [ ] View formatted description on public page
- [ ] Test with empty description
- [ ] Test with plain text (backward compatibility)
- [ ] Test error fallback (simulate TipTap failure)
- [ ] Test mobile editor experience
- [ ] Verify character count accuracy
- [ ] Test undo/redo functionality
- [ ] Verify link insertion and editing

## Future Enhancements

Potential features that could be added:

1. **Image Upload** - Allow inline images in descriptions
2. **Code Blocks** - For technical property details
3. **Tables** - For structured information (pricing tiers, etc.)
4. **Collaboration** - Real-time multi-user editing
5. **Version History** - Track description changes over time
6. **Templates** - Pre-defined description templates
7. **AI Assistance** - Auto-generate descriptions from property features

## Dependencies

### npm Packages

```json
{
	"@tiptap/core": "^2.10.0",
	"@tiptap/starter-kit": "^2.10.0",
	"@tiptap/extension-link": "^2.10.0",
	"@tiptap/extension-placeholder": "^2.10.0",
	"@tiptap/extension-character-count": "^2.10.0",
	"svelte-tiptap": "^1.0.0",
	"@tailwindcss/typography": "^0.5.0"
}
```

### Browser Support

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 88+             |
| Firefox | 84+             |
| Safari  | 14+             |
| Edge    | 88+             |

## Resources

- **TipTap Documentation**: https://tiptap.dev/
- **Svelte-TipTap**: https://github.com/sibiraj-s/svelte-tiptap
- **Tailwind Typography**: https://tailwindcss.com/docs/typography-plugin
- **Example Usage**: See implementation in `/admin/properties/[id]` and `/(home)/properties/[id]`

## Support

For issues or questions:

1. Check this documentation first
2. Review the implementation plan in artifacts
3. Check browser console for error messages
4. Verify all dependencies are installed
5. Test with error boundary fallbacks
