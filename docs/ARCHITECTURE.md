# Architecture & Development Standards

## Database & Querying

### Drizzle ORM

We use Drizzle ORM with SQLite for its type safety and performance. The schema is defined in [src/lib/server/db/schema.ts](file:///c:/dev/FLY-pg-v2/src/lib/server/db/schema.ts).

### Relational Query Builder (RQB) v2 Standard

We strictly follow the **[Drizzle RQB v2 standard](https://orm.drizzle.team/docs/rqb#querying)**. This prioritizes an **object-based syntax** over method chaining for `where` clauses and sorts, providing superior type inference and consistency.

- **Why v2?**: It unifies the API for filtering and selecting, making queries look more like the shape of the data they return (similar to GraphQL).
- **Filtering (`where`)**: Use object syntax.
  ```typescript
  // Correct (v2)
  where: {
      id: "123",
      status: { in: ["active", "pending"] },
      createdAt: { gt: new Date() }
  }
  ```
- **Sorting (`orderBy`)**: Use object syntax for simple sorts.
  ```typescript
  // Simple
  orderBy: { createdAt: "desc" }
  ```
  _Reference_: [Drizzle Sort Documentation](https://orm.drizzle.team/docs/rqb#sorting)

## Remote Functions Pattern

We use a custom pattern for type-safe data fetching and mutations that abstracts SvelteKit's `load` and `actions` into reusable functions. This keeps our `+page.server.ts` files thin or non-existent.

### Concept

This pattern mimics Remote Procedure Calls (RPC). Instead of fetching APIs, we import server-side functions directly into our frontend code.

- **`*.remote.ts`**: Contains the server-side logic (e.g., [bookings.remote.ts](file:///c:/dev/FLY-pg-v2/src/routes/admin/bookings/bookings.remote.ts)).
- **`query`**: Wraps logic for **Fetching Data** (GET).
  - _Underlying Tech_: Replaces [SvelteKit Load Functions](https://kit.svelte.dev/docs/load).
  - _Usage_: `const data = await getItems();`
- **`form`**: Wraps logic for **Mutations** (POST/PUT/DELETE).
  - _Underlying Tech_: Replaces [SvelteKit Form Actions](https://kit.svelte.dev/docs/form-actions).
  - _Validation_: Integrates [Zod](https://zod.dev/) natively for input validation.

## Role-Based Access Control (RBAC)

User roles are defined in the `user` table and enforced in remote functions using `sessionUser.role`.

### Defined Roles

1.  **Admin**: Full system access (Properties, Rooms, Bookings, Users, Settings).
2.  **Manager**: Operational access (similar to Admin but restricted from system-wide settings/deletions if configured).
3.  **Property Manager**: Access restricted to assigned properties only.
4.  **Staff**: Task-based access.
    - _Chef_: Food/Ticket management.
    - _Janitor_: Maintenance tickets.
    - _Security_: Visitor logs/Security tickets.
5.  **Customer**: End-user. Can book rooms, pay bills, raise tickets.

## Authentication

Authentication is handled by **[Better-Auth](https://www.better-auth.com/)**.

- **Sessions**: Stored in `session` table.
- **Verification**: Email verification supported.
- **Accounts**: Linking to external providers (Google, GitHub etc.) supported via `account` table.
