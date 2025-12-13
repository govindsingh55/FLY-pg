# Task List: Property Management System (PMS)

## Phase 1: Foundation & Setup

- [x] Install dependencies: `zod`, `bits-ui` (for shadcn)
- [x] Initialize/Verify Shadcn Svelte
- [x] Finalize `schema.ts` (Users, Properties, Rooms, Customers, Bookings)
- [x] Run `db:push` / Migration
- [x] Verify `better-auth` configuration

## Phase 2: Core Admin Features (The Base)

- [x] **Properties & Rooms**
  - [x] Define Zod Schemas (`src/lib/schemas/property.ts`)
  - [x] `admin/properties` List View (Shadcn Table)
  - [x] `admin/properties/create` + `[id]/edit` (Form Actions)
  - [x] Room Management (Nested or separate)
- [x] **Customers**
  - [x] Customer Zod Schema
  - [x] Customer List & Details View
  - [x] Create/Edit Customer Actions

## Phase 3: Bookings & Operations

- [x] **Booking System**
  - [x] Booking Form (Date picker, Room selection)
  - [x] Availability Check Logic
  - [x] Create Booking Action
- [x] **Payments**
  - [x] Payment Recording Action
  - [x] Payment History Table

## Phase 4: Customer Portal

- [x] **Dashboard**
  - [x] Overview (Current Booking)
  - [x] Payment History
- [x] **Tickets**
  - [x] Create Ticket Form
  - [x] Ticket List View
  - [x] Tenant Notification View

## Phase 5: Polish & UI

- [x] Landing Page (Hero, Features) with Shadcn
- [x] Responsive/Mobile Check
- [x] Error Boundaries & Toasts

## Phase 6: Review & Verify

- [x] Verify Role Access (Admin vs Customer)
- [x] Walkthrough of core flows
- [x] Authentication pages (Login/Signup)
- [x] Route protection middleware
