# Implementation Plan: Property Management System (PMS)

## Goal Description

Build a comprehensive Property Management System using SvelteKit, Drizzle ORM, and SQLite. This system will manage properties, rooms, tenants (customers), bookings, payments, and maintenance tickets. The goal is to create a robust, type-safe, and high-performance application with a clear separation between the public-facing site, customer dashboard, and admin management portal.

## Technology Stack

| Component      | Choice        | Notes                                             |
| :------------- | :------------ | :------------------------------------------------ |
| **Framework**  | SvelteKit     | Full stack web framework                          |
| **Language**   | TypeScript    | Strict type safety                                |
| **Database**   | SQLite        | Using `libsql` or `better-sqlite3`                |
| **ORM**        | Drizzle ORM   | Type-safe SQL definitions                         |
| **UI Library** | Shadcn Svelte | Re-usable UI components                           |
| **Styling**    | TailwindCSS   | Utility-first CSS                                 |
| **Auth**       | Better Auth   | Secure authentication & session management        |
| **Validation** | Zod + Actions | Server-side validation with standard Form Actions |

## User Review Required

> [!IMPORTANT]
> **Admin Panel Construction**: We are building the Admin Dashboard from scratch using **Shadcn Svelte** components.
> **Form Handling**: We will use standard **SvelteKit Remote Functions (Form Actions)** paired with **Zod** for validation, ensuring a lightweight and robust approach without extra dependencies like Superforms.

## Proposed Architecture & Schema

### 1. Database Schema (Drizzle)

We will define the following tables in `src/lib/server/db/schema.ts`.

#### Core Identity

- **users**: `id`, `name`, `email`, `password`, `role` (admin/manager/staff/customer), `image`, `created_at`

#### Business Domain

- **properties**: `id`, `name`, `description`, `address`, `amenities` (JSON), `images` (JSON)
- **rooms**: `id`, `property_id`, `number`, `type`, `price`, `status`
- **customers**: `id`, `user_id`, `name`, `email`, `phone`, `id_proof` details
- **bookings**: `id`, `property_id`, `room_id`, `customer_id`, `dates`, `status`
- **payments**: `id`, `booking_id`, `amount`, `type`, `status`, `transaction_id`
- **tickets**: `id`, `customer_id`, `issue_type`, `description`, `status`
- **notifications**: `id`, `user_id`, `message`, `read_status`

### 2. Authentication & Roles

- **Admin/Staff**: Access to `/admin` routes.
- **Customer**: Access to `/dashboard` routes.
- **Public**: Landing page and contact.

### 3. Application Structure

- `src/routes/`
  - `admin/` (Protected)
    - `properties/`, `customers/`, `bookings/`, `payments/`
  - `dashboard/` (Customer Protected)
    - `overview`, `history`, `tickets`
  - `(public)/`
    - `login/`, `register/`, `+page.svelte` (Landing)

## Feature Specifications

### 1. Rent Management

- Admin can record payments and view ledgers.
- System allows generating rent dues.

### 2. Validation & Safety

- **SvelteKit Form Actions** for all data mutations.
- **Zod schemas** defined in `src/lib/schemas` (or co-located) for validation.
- **Remote functions** for API-like interactions where forms don't fit.

## Verification Plan

### Automated Tests

- **Unit**: Test Zod schemas.
- **E2E**: Verify Auth Flow and Critical Admin CRUD paths (Create Property, Create Booking).

### Manual Verification

- **Role Checks**: Ensure 'Customer' cannot access `/admin`.
- **Data Integrity**: Verify constraint handling (e.g., deleting a property with active bookings).
