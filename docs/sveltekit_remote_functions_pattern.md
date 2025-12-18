# SvelteKit Remote Functions & Form Handling Pattern

This document outlines the recommended pattern for handling data fetching, form submissions, and error handling using SvelteKit Remote Functions (`@sveltejs/kit` + `svelte-kit-remote-functions`), specifically tailored for this codebase.

## 1. Remote Functions Definition (`*.remote.ts`)

Create a `*.remote.ts` file (e.g., `visits.remote.ts`) alongside your route or in a shared location.

### Query Function (Fetching Data)

Use `query` to fetch data. It replaces `load` functions.

```typescript
import { query } from '$app/server'; // or specific library import
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const getData = query(async () => {
    // 1. Authentication/Authorization checks (e.g. getSession helper)

    // 2. DB Operations
    const data = await db.query.myTable.findMany();

    return { data };
});
```

### Form Function (Mutations)

Use `form` to handle submissions. It replaces `actions`.

```typescript
import { form } from '$app/server';
import { z } from 'zod';

export const submitData = form(
    // 1. Zod Schema for Validation
    z.object({
        name: z.string().min(1),
        email: z.string().email()
    }),
    // 2. Handler
    async (data) => {
        // Auth checks...

        // DB Operations...

        // Refresh relevant queries automatically
        await getData().refresh();

        return { success: true };
    }
);
```

---

## 2. Frontend Implementation (`+page.svelte` or Components)

### Imports

```svelte
<script lang="ts">
	import { getData, submitData } from './my.remote';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';

	// Initial data load
	let dataPromise = $state(getData());
</script>
```

### Data Fetching with Query

Use `{#await}` block.

```svelte
{#await dataPromise}
	<Skeleton />
{:then { data }}
	<!-- Render Data -->
{:catch error}
	<ErrorView {error} retry={() => (dataPromise = getData())} />
{/await}
```

### Form Submission

Use the `enhance` action provided by the remote function.

```svelte
<form
    use:submitData.enhance={async ({ submit }) => {
        // 1. Optimistic UI or setup code here

        try {
            // 2. Submit the form
            await submit();

            // 3. Success handling
            toast.success('Saved successfully!');
            // Close modal/dialog if applicable
        } catch (err: any) {
            // 4. Error handling (Network/Server errors)
            toast.error(err.message || 'Submission failed');
        }
    }}
>
    <!-- Inputs with Error Display -->
    <div class="space-y-2">
        <label>Name</label>
        <input name="name" required />
        <!-- Access field-specific validation errors -->
        {#if submitData.fields.name.errors}
             <p class="text-red-500">{submitData.fields.name.errors}</p>
        {/if}
        <!-- OR Using allIssues helper -->
         {#each submitData.fields.allIssues() || [] as issue}
            {#if issue.path[0] === 'name'}
                <p class="text-destructive">{issue.message}</p>
            {/if}
         {/each}
    </div>

    <Button type="submit" disabled={submitData.pending}>
        {submitData.pending ? 'Saving...' : 'Save'}
    </Button>
</form>
```

_Note: The exact API for errors may vary based on the specific remote functions library version usage (e.g. `submitData.fields.name` vs `submitData.errors`). Adapt based on `visit-request-form.svelte` example._

---

## 3. Error Handling & Boundaries

### Component Level (`svelte:boundary`)

Wrap complex components or the entire page content in a `<svelte:boundary>` to catch runtime errors during rendering (e.g., if `dataPromise` fails in a way not caught by `#await`).

```svelte
<svelte:boundary>
	<MyFeatureComponent />

	{#snippet failed(error, reset)}
		<div class="error-container">
			<p>Something went wrong: {error.message}</p>
			<button onclick={reset}>Try Again</button>
		</div>
	{/snippet}
</svelte:boundary>
```

### Form Component Pattern

For keeping code clean, extract forms into separate components (e.g., `_components/my-form.svelte`).

1.  **Props**: Pass `open` state (for dialogs) and strictly typed `data` (e.g. `properties` list for a select).
2.  **Boundary**: Include a `<svelte:boundary>` inside the component or wrap its usage to ensure a form crash doesn't break the whole page.
3.  **Responsive**: Use `MediaQuery` to render `Sheet` (Desktop) or `Drawer` (Mobile).

---

## 4. Summary Checklist

1.  **Define Remote Functions**: `query` for reads, `form` for writes with Zod.
2.  **Call in Component**: Import and call functions directly.
3.  **Handle State**: Use `$state` for promises/loading.
4.  **Enhance Form**: Use `function.enhance` with `try/catch` for toast feedback.
5.  **Display Errors**: Show Zod validation errors inline.
6.  **Boundaries**: Wrap critical sections in `<svelte:boundary>`.
