# Dark Mode Implementation

This project uses [mode-watcher](https://github.com/svecosystem/mode-watcher) for dark mode support, following the [shadcn-svelte dark mode guide](https://www.shadcn-svelte.com/docs/dark-mode/svelte).

## How It Works

### 1. ModeWatcher Component

The `ModeWatcher` component is added to the root layout (`src/routes/+layout.svelte`) and handles:

- Automatic detection of system theme preference
- Persisting user's theme choice in localStorage
- Applying the appropriate `dark` class to the document

### 2. CSS Variables

Theme colors are defined in `src/routes/layout.css` using CSS custom properties:

- `:root` contains light mode colors
- `.dark` contains dark mode colors
- The `@custom-variant dark (&:is(.dark *))` enables Tailwind's dark mode utilities

### 3. Theme Toggle Component

A reusable `ThemeToggle` component (`src/lib/components/theme-toggle.svelte`) provides:

- A button to toggle between light and dark modes
- Animated sun/moon icons that transition smoothly
- Uses the `toggleMode` function from mode-watcher

## Usage

The theme toggle button is already added to:

- Dashboard header (`/dashboard/*`)
- Admin header (`/admin/*`)

### Adding Theme Toggle to Other Pages

```svelte
<script>
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
</script>

<ThemeToggle />
```

### Programmatic Theme Control

```svelte
<script>
	import { toggleMode, setMode, mode } from 'mode-watcher';

	// Toggle between light and dark
	toggleMode();

	// Set specific mode
	setMode('dark');
	setMode('light');
	setMode('system'); // Use system preference

	// Read current mode (reactive)
	console.log($mode); // 'light' | 'dark'
</script>
```

### Using Dark Mode in Components

Use Tailwind's `dark:` variant for dark mode styles:

```svelte
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">Content that adapts to theme</div>
```

## Features

- ✅ Automatic system theme detection
- ✅ User preference persistence (localStorage)
- ✅ Smooth transitions between themes
- ✅ SSR-safe implementation
- ✅ No flash of unstyled content (FOUC)
- ✅ Accessible theme toggle button

## Configuration

The default mode can be configured in the `ModeWatcher` component:

```svelte
<ModeWatcher defaultMode="system" />
```

Options:

- `"light"` - Always start in light mode
- `"dark"` - Always start in dark mode
- `"system"` - Use system preference (default)
