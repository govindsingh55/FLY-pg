# Drizzle Relational Query Builder v2 (RQB v2) Standard

This document outlines the standard for using Drizzle RQB v2 in this project. RQB v2 prioritizes an **object-based syntax** for filters, selection, and sorting, which improves type safety and readability.

## 1. Selection (Columns)

Use the `columns` object to specify which fields to include or exclude.

```typescript
// Include specific columns
const result = await db.query.users.findMany({
  columns: {
    id: true,
    name: true,
  }
});

// Exclude specific columns
const result = await db.query.users.findMany({
  columns: {
    password: false,
  }
});
```

## 2. Filtering (Where)

RQB v2 supports direct object filtering for simple and complex conditions.

### Simple Equality

```typescript
const result = await db.query.users.findMany({
  where: {
    id: "uuid-123",
    status: "active",
  }
});
```

### Advanced Operators

Use nested objects for operators like `gt`, `lt`, `like`, `in`, `isNull`, and `ne` (not equal).

```typescript
const result = await db.query.users.findMany({
  where: {
    age: { gt: 18 },
    role: { in: ["admin", "manager"] },
    deletedAt: { isNull: true },
    name: { like: "%John%" },
    status: { ne: "blocked" },
  }
});
```

### Logical Operators (OR / AND)

Logical operators are expressed as keys in the filter object.

```typescript
const result = await db.query.users.findMany({
  where: {
    OR: [
      { name: { like: "%Admin%" } },
      { email: { like: "%@admin.com" } }
    ]
  }
});
```

## 3. Sorting (OrderBy)

RQB v2 supports object-based sorting. This is the preferred method for simple sorts.

```typescript
// Single column sort
const result = await db.query.users.findMany({
  orderBy: { createdAt: "desc" }
});

// Multiple columns sort
const result = await db.query.users.findMany({
  orderBy: {
    role: "asc",
    createdAt: "desc"
  }
});
```

For complex or SQL-based sorting, you can still use the callback syntax:

```typescript
const result = await db.query.users.findMany({
  orderBy: (t, { desc }) => [desc(t.createdAt)]
});
```

## 4. Relations (With)

Relations can be included and filtered recursively.

```typescript
const result = await db.query.users.findFirst({
  where: { id: "user-1" },
  with: {
    posts: {
      where: { deletedAt: { isNull: true } },
      orderBy: { createdAt: "desc" },
      limit: 5,
      with: {
        comments: true
      }
    }
  }
});
```

### Relation Filtering ("Where Exists")

You can filter a table based on the content of its relations.

```typescript
// Find users who have at least one post with the title "Hello"
const usersWithHelloPosts = await db.query.users.findMany({
  where: {
    posts: {
      title: "Hello"
    }
  }
});
```

## 5. Pagination

Use `limit` and `offset` directly in the query object.

```typescript
const result = await db.query.posts.findMany({
  limit: 10,
  offset: 20,
  orderBy: { createdAt: "desc" }
});
```

## 6. Extras & Subqueries

Use `extras` to include computed fields or subqueries.

### Custom SQL Fields

```typescript
import { sql } from 'drizzle-orm';

const result = await db.query.users.findMany({
  extras: {
    lowerName: (users, { sql }) => sql`lower(${users.name})`,
    fullName: (users, { sql }) => sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`
  }
});
```

### Subqueries (e.g. Total Counts)

```typescript
import { posts } from './schema';
import { eq } from 'drizzle-orm';

const result = await db.query.users.findMany({
  extras: {
    totalPosts: (table) => db.$count(posts, eq(posts.authorId, table.id))
  }
});
```

## 7. Migration from v1 Callback Syntax

When migrating from the old callback syntax `(fields, { eq, and }) => ...`, move the logic into a direct object.

**Before (v1):**

```typescript
where: (t, { and, eq, isNull }) => and(eq(t.id, id), isNull(t.deletedAt))
```

**After (v2):**

```typescript
where: { id, deletedAt: { isNull: true } }
```
