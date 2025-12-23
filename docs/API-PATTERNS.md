# API Patterns & Remote Functions

This document explains the custom API architecture used in this Property Management System, specifically the **Remote Functions Pattern**.

---

## Overview

Instead of traditional REST APIs or SvelteKit's standard `load` and `actions` pattern, we use a custom **Remote Functions Pattern** that mimics Remote Procedure Calls (RPC). This allows us to:

- Import server-side functions directly into frontend code
- Maintain full type safety end-to-end
- Keep `+page.server.ts` files thin or non-existent
- Centralize business logic in reusable `*.remote.ts` files

---

## Remote Functions Pattern

### Concept

Remote functions are server-side functions that can be called from the frontend as if they were local functions, with full TypeScript type inference.

### File Structure

```
src/routes/admin/bookings/
├── bookings.remote.ts    # Server-side logic
├── +page.svelte          # Frontend UI
└── +page.server.ts       # (Optional, minimal loader)
```

### Two Core Primitives

#### 1. `query` - Data Fetching

Wraps logic for **GET operations** (data fetching).

**Replaces**: [SvelteKit Load Functions](https://kit.svelte.dev/docs/load)

**Example**:

```typescript
// bookings.remote.ts
import { query } from '$lib/server/remote';
import { db } from '$lib/server/db';

export const getBookings = query(async () => {
  const bookings = await db.query.bookings.findMany({
    with: {
      customer: true,
      property: true,
      room: true
    }
  });

  return bookings;
});
```

**Frontend Usage**:

```svelte
<script lang="ts">
	import { getBookings } from './bookings.remote';

	// Fully typed!
	const bookings = await getBookings();
</script>
```

#### 2. `form` - Mutations

Wraps logic for **POST/PUT/DELETE operations** (data mutations).

**Replaces**: [SvelteKit Form Actions](https://kit.svelte.dev/docs/form-actions)

**Integrates**: [Zod](https://zod.dev/) for input validation

**Example**:

```typescript
// bookings.remote.ts
import { form } from '$lib/server/remote';
import { createBookingSchema } from '$lib/schemas/booking';
import { db } from '$lib/server/db';

export const createBooking = form(createBookingSchema, async (data, { sessionUser }) => {
  const booking = await db.insert(bookings).values({
    ...data,
    createdBy: sessionUser.id
  }).returning().get();

  return { success: true, booking };
});
```

**Frontend Usage**:

```svelte
<script lang="ts">
	import { createBooking } from './bookings.remote';

	let formData = {
		propertyId: '',
		roomId: '',
		customerId: ''
		// ...
	};

	async function handleSubmit() {
		const result = await createBooking(formData);
		if (result.success) {
			// Handle success
		}
	}
</script>
```

---

## Database Querying with Drizzle RQB

We use **Drizzle ORM** with the **Relational Query Builder (RQB) v2 standard**.

**Documentation**: [Drizzle RQB](https://orm.drizzle.team/docs/rqb)

### Why RQB v2?

- **Object-based syntax** instead of method chaining
- Superior type inference
- Consistent API for filtering and selecting
- Data shape mirrors the query structure (GraphQL-like)

### Query Examples

#### Simple Query with Relations

```typescript
const properties = await db.query.properties.findMany({
  with: {
    rooms: true,
    amenities: true
  }
});
```

#### Filtering (v2 Syntax)

```typescript
const activeContracts = await db.query.contracts.findMany({
  where: {
    status: 'active',
    customerId: { eq: customerId }
  },
  with: {
    property: true,
    room: true,
    customer: true
  }
});
```

**Object-based filtering**:

```typescript
where: {
  id: "123",                           // Exact match
  status: { in: ["active", "pending"] }, // IN clause
  createdAt: { gt: new Date() },        // Greater than
  amount: { gte: 1000, lte: 5000 }      // Range
}
```

#### Sorting (v2 Syntax)

```typescript
const payments = await db.query.payments.findMany({
  orderBy: { createdAt: "desc" }  // Simple object syntax
});
```

**Documentation**: [Drizzle Sort Documentation](https://orm.drizzle.team/docs/rqb#sorting)

#### Pagination

```typescript
const customers = await db.query.customers.findMany({
  limit: 20,
  offset: (page - 1) * 20
});
```

#### Complex Filtering with Search

```typescript
import { or, like } from 'drizzle-orm';

const searchQuery = "john";

const customers = await db.query.customers.findMany({
  where: or(
    like(customers.name, `%${searchQuery}%`),
    like(customers.email, `%${searchQuery}%`),
    like(customers.phone, `%${searchQuery}%`)
  ),
  limit: 20
});
```

---

## Authentication & Authorization

### Session Access

Remote functions have access to the current session user:

```typescript
export const createPayment = form(paymentSchema, async (data, { sessionUser }) => {
  // sessionUser.id - Current user ID
  // sessionUser.role - User role (admin, manager, etc.)
  // sessionUser.email - User email

  if (sessionUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  // ... proceed with payment creation
});
```

### Role-Based Filtering

**Property Managers** see only assigned properties:

```typescript
export const getProperties = query(async ({ sessionUser }) => {
  let whereClause = {};

  if (sessionUser.role === 'property_manager') {
    // Get assigned properties only
    const assignments = await db.query.propertyManagerAssignments.findMany({
      where: { userId: sessionUser.id }
    });

    const propertyIds = assignments.map(a => a.propertyId);

    whereClause = {
      id: { in: propertyIds }
    };
  }

  const properties = await db.query.properties.findMany({
    where: whereClause
  });

  return properties;
});
```

---

## Validation with Zod

All mutations use **Zod schemas** for input validation.

**Schema Location**: [src/lib/schemas](file:///c:/dev/FLY-pg-v2/src/lib/schemas)

### Example Schema

```typescript
// src/lib/schemas/booking.ts
import { z } from 'zod';

export const createBookingSchema = z.object({
  propertyId: z.string().uuid(),
  roomId: z.string().uuid(),
  customerId: z.string().uuid(),
  bookingCharge: z.number().int().min(0),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending')
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
```

### Using in Forms

```typescript
export const createBooking = form(createBookingSchema, async (data) => {
  // data is fully typed as CreateBookingInput
  // Validation happens automatically before this function runs

  const booking = await db.insert(bookings).values(data).returning().get();
  return { success: true, booking };
});
```

---

## Error Handling

### Try-Catch in Remote Functions

```typescript
export const deleteProperty = form(deleteSchema, async (data) => {
  try {
    await db.delete(properties).where(eq(properties.id, data.id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { success: false, error: 'Failed to delete property' };
  }
});
```

### Frontend Error Handling

```svelte
<script lang="ts">
	import { toast } from 'svelte-sonner';

	async function handleDelete() {
		const result = await deleteProperty({ id: propertyId });

		if (result.success) {
			toast.success('Property deleted successfully');
		} else {
			toast.error(result.error || 'An error occurred');
		}
	}
</script>
```

---

## Pagination & Search Pattern

### Remote Function with Pagination

```typescript
export const getCustomers = query(async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const search = url.searchParams.get('search') || '';
  const limit = 20;
  const offset = (page - 1) * limit;

  let whereClause = {};

  if (search) {
    whereClause = or(
      like(customers.name, `%${search}%`),
      like(customers.email, `%${search}%`),
      like(customers.phone, `%${search}%`)
    );
  }

  const data = await db.query.customers.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: { createdAt: 'desc' }
  });

  const total = await db.select({ count: sql`count(*)` })
    .from(customers)
    .where(whereClause)
    .get();

  return {
    customers: data,
    pagination: {
      page,
      limit,
      total: total.count,
      pages: Math.ceil(total.count / limit)
    }
  };
});
```

### Frontend with URL Parameters

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let searchQuery = $page.url.searchParams.get('search') || '';
	let currentPage = parseInt($page.url.searchParams.get('page') || '1');

	function handleSearch() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		params.set('page', '1');

		goto(`?${params.toString()}`);
	}

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', newPage.toString());

		goto(`?${params.toString()}`);
	}
</script>
```

---

## Soft Deletes

Most tables have `deletedAt` and `deletedBy` fields for soft deletion.

### Soft Delete Pattern

```typescript
export const deleteRoom = form(deleteSchema, async (data, { sessionUser }) => {
  await db.update(rooms)
    .set({
      deletedAt: new Date(),
      deletedBy: sessionUser.id
    })
    .where(eq(rooms.id, data.id));

  return { success: true };
});
```

### Exclude Deleted Records

```typescript
const activeRooms = await db.query.rooms.findMany({
  where: {
    propertyId: propertyId,
    deletedAt: { isNull: true }
  }
});
```

---

## Relationships & Joins

### One-to-Many Relations

```typescript
const property = await db.query.properties.findFirst({
  where: { id: propertyId },
  with: {
    rooms: true,           // All rooms in this property
    amenities: true,       // Amenities via junction table
    media: true            // Property images/docs
  }
});
```

### Many-to-One Relations

```typescript
const booking = await db.query.bookings.findFirst({
  where: { id: bookingId },
  with: {
    customer: true,   // Customer who made booking
    property: true,   // Property being booked
    room: true,       // Specific room
    payments: true    // All payments for this booking
  }
});
```

### Nested Relations

```typescript
const contract = await db.query.contracts.findFirst({
  where: { id: contractId },
  with: {
    customer: {
      with: {
        user: true  // User account linked to customer
      }
    },
    property: {
      with: {
        rooms: true  // All rooms in the property
      }
    },
    electricityReadings: true  // Monthly electricity bills
  }
});
```

---

## Best Practices

### 1. Keep Remote Functions Focused

Each remote function should have a single responsibility:

```typescript
// ✅ Good - focused function
export const getActiveContracts = query(async () => {
  return await db.query.contracts.findMany({
    where: { status: 'active' }
  });
});

// ❌ Bad - doing too much
export const getAllData = query(async () => {
  const contracts = await db.query.contracts.findMany();
  const payments = await db.query.payments.findMany();
  const customers = await db.query.customers.findMany();
  // ... too much in one function
});
```

### 2. Use Zod Schemas for All Mutations

Always validate input data:

```typescript
// ✅ Good - validated input
export const createProperty = form(propertySchema, async (data) => {
  // data is validated and typed
});

// ❌ Bad - unvalidated input
export const createProperty = async (data: any) => {
  // No validation, unsafe
};
```

### 3. Implement Proper Error Handling

```typescript
// ✅ Good - catches errors
export const updateContract = form(contractSchema, async (data) => {
  try {
    const contract = await db.update(contracts)
      .set(data)
      .where(eq(contracts.id, data.id))
      .returning()
      .get();

    return { success: true, contract };
  } catch (error) {
    console.error('Error updating contract:', error);
    return { success: false, error: 'Failed to update contract' };
  }
});
```

### 4. Use Drizzle RQB v2 Syntax

```typescript
// ✅ Good - RQB v2 object syntax
where: {
  status: 'active',
  amount: { gte: 1000 }
}

// ❌ Avoid - method chaining
where(eq(table.status, 'active'), gte(table.amount, 1000))
```

### 5. Property-Based Access Control

Always filter by property for property managers:

```typescript
export const getRooms = query(async ({ sessionUser, url }) => {
  const propertyId = url.searchParams.get('propertyId');

  // Check if user has access to this property
  if (sessionUser.role === 'property_manager') {
    const hasAccess = await db.query.propertyManagerAssignments.findFirst({
      where: {
        userId: sessionUser.id,
        propertyId: propertyId
      }
    });

    if (!hasAccess) {
      throw new Error('Unauthorized access to property');
    }
  }

  // ... proceed with query
});
```

---

## Common Patterns

### Create-Read-Update-Delete (CRUD)

```typescript
// Create
export const createItem = form(createSchema, async (data) => {
  const item = await db.insert(table).values(data).returning().get();
  return { success: true, item };
});

// Read (List)
export const getItems = query(async () => {
  return await db.query.table.findMany();
});

// Read (Single)
export const getItem = query(async ({ url }) => {
  const id = url.searchParams.get('id');
  return await db.query.table.findFirst({ where: { id } });
});

// Update
export const updateItem = form(updateSchema, async (data) => {
  const item = await db.update(table)
    .set(data)
    .where(eq(table.id, data.id))
    .returning()
    .get();
  return { success: true, item };
});

// Delete (Soft)
export const deleteItem = form(deleteSchema, async (data, { sessionUser }) => {
  await db.update(table)
    .set({ deletedAt: new Date(), deletedBy: sessionUser.id })
    .where(eq(table.id, data.id));
  return { success: true };
});
```

---

## Refresh Pattern

After mutations, trigger data refresh on the frontend:

```svelte
<script lang="ts">
	import { invalidate } from '$app/navigation';

	async function handleCreate() {
		const result = await createBooking(formData);

		if (result.success) {
			await invalidate('app:bookings'); // Refresh bookings data
			toast.success('Booking created');
		}
	}
</script>
```

---

## Summary

The Remote Functions Pattern provides:

- ✅ **Type Safety**: End-to-end TypeScript inference
- ✅ **Developer Experience**: Import server functions like local functions
- ✅ **Validation**: Built-in Zod schema validation
- ✅ **Authorization**: Session user access in all functions
- ✅ **Maintainability**: Centralized business logic
- ✅ **Consistency**: Standardized API patterns across the app

**Reference Implementation**: [bookings.remote.ts](file:///c:/dev/FLY-pg-v2/src/routes/admin/bookings/bookings.remote.ts)
