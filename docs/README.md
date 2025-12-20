# fly-pg-v2

A comprehensive Property Management System (PMS) built with modern web technologies.

## Technology Stack & Documentation

### Core Framework

- **[SvelteKit](https://kit.svelte.dev/docs/introduction)**: Full-stack meta-framework for Svelte. Used for routing, server-side rendering, and API endpoints.

### Database & ORM

- **[SQLite](https://www.sqlite.org/docs.html)**: Lightweight, serverless database engine.
- **[Drizzle ORM](https://orm.drizzle.team/docs/overview)**: TypeScript ORM for SQL databases.
  - _Reference_: [Relational Query Builder (RQB)](https://orm.drizzle.team/docs/rqb)
  - _Reference_: [Schema Definition](https://orm.drizzle.team/docs/sql-schema-declaration)

### Authentication

- **[Better-Auth](https://www.better-auth.com/docs/introduction)**: Comprehensive authentication solution.
  - Handles Sessions, Email Verification, and OAuth (Google/GitHub).

### UI & Styling

- **[Shadcn-Svelte](https://www.shadcn-svelte.com/docs)**: Reusable UI components built with Tailwind CSS.
- **[Tailwind CSS](https://tailwindcss.com/docs)**: Utility-first CSS framework.
- **[Lucide Svelte](https://lucide.dev/guide/packages/lucide-svelte)**: Icon library.
- **[Bits UI](https://www.bits-ui.com/docs/introduction)**: Headless UI primitives powering Shadcn.

### Utilities

- **[Zod](https://zod.dev/)**: TypeScript-first schema declaration and validation.

## Directory Structure

- `src/lib/server/db`: Database schema (`schema.ts`) and connection setup.
- `src/lib/schemas`: Shared Zod validation schemas.
- `src/lib/components`: UI components (Shadcn and custom).
- `src/routes`: Application pages and API routes.
  - `admin`: Admin dashboard for managing properties, users, bookings, etc.
  - `dashboard`: Customer/User dashboard.
  - `(home)`: Public facing pages.
- `scripts`: Utility scripts (e.g., `seed.ts` for populating test data).
- `docs`: Project documentation.

## Quick Start

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Database Setup**:

    ```bash
    # Push schema to database
    npm run db:push

    # (Optional) Seed with test data
    npm run db:seed
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Key Commands

- `npm run dev`: Start dev server.
- `npm run db:generate`: Generate migrations from schema changes.
- `npm run db:migrate`: Apply migrations.
- `npm run db:studio`: Open Drizzle Studio to view data.
- `npm run check`: Run Svelte check.
