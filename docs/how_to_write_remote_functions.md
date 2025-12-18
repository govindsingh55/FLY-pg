# Writing Remote Functions: A Guide

This guide explains how to write `query` and `form` remote functions in `abc.remote.ts` files, based on the implementation in the dashboard modules.

## File Structure

Create a file named `abc.remote.ts` (or `[feature].remote.ts`) alongside your route.

## 1. Helper Functions

It is common to need session/user access. Use `getRequestEvent()` from separate helper or inline.

```typescript
import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';

const getSession = () => {
    const event = getRequestEvent();
    if (!event || !event.locals.session || !event.locals.user) {
        throw error(401, 'Unauthorized');
    }
    return { session: event.locals.session, sessionUser: event.locals.user };
};
```

## 2. Query Function (Fetching Data)

Use `query` to fetch data. This replaces `load` functions.

```typescript
// abc.remote.ts
import { query } from '$app/server';
import { db } from '$lib/server/db';

export const getItems = query(async () => {
    const { sessionUser } = getSession();

    // Perform database queries
    const items = await db.query.items.findMany({
        where: { userId: sessionUser.id }
    });

    return { items };
});
```

## 3. Form Function (Mutations)

Use `form` to handle submissions. This replaces form actions. Zod is used for validation.

```typescript
// abc.remote.ts
import { form } from '$app/server';
import { z } from 'zod'; // or import schema from $lib/schemas
import { db } from '$lib/server/db';
import { itemsTable } from '$lib/server/db/schema';

// Define schema inline or import it
const itemSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional()
});

export const createItem = form(itemSchema, async (data) => {
    const { sessionUser } = getSession();

    try {
        // Perform database insertion/update
        await db.insert(itemsTable).values({
            userId: sessionUser.id,
            name: data.name,
            description: data.description
        });

        // REFRESH the query so the UI updates automatically
        await getItems().refresh();

        return { success: true };
    } catch (e) {
        console.error(e);
        throw error(500, 'Failed to create item');
    }
});
```

## 4. Usage in Svelte Component (`+page.svelte`)

```svelte
<script lang="ts">
	import { getItems, createItem } from './abc.remote';

	// 1. Initialize Query
	let dataPromise = $state(getItems());
</script>

<!-- 2. Render Data with Await Block -->
{#await dataPromise}
	<p>Loading...</p>
{:then { items }}
	{#each items as item}
		<div>{item.name}</div>
	{/each}
{:catch error}
	<p>Error: {error.message}</p>
{/await}

<!-- 3. Form Submission -->
<form
	use:createItem.enhance={async ({ submit }) => {
		try {
			await submit();
			// Success! Modal close / Toast here
		} catch (e) {
			// Error handling
		}
	}}
>
	<!-- 4. Field Errors -->
	<input name="name" />
	{#if createItem.fields.name.errors}
		<p class="error">{createItem.fields.name.errors}</p>
	{/if}

	<button disabled={createItem.pending}>Submit</button>
</form>
```
