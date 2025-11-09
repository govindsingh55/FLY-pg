# Support System Refactor Plan

## Objectives
- Ensure support tickets flow smoothly from customer creation through staff resolution.
- Allow relevant staff (chef, cleaning, security, maintenance) to discover and self-assign tickets within their scope.
- Preserve optional customer media uploads and enrich conversation history with correct sender metadata.
- Provide a transparent, testable process for customers, staff, managers, and admins.

## Current Pain Points
- Payload select values misalign: the "Maintenance" option saves as `manager`, causing ticket creation failures for the default UI selection.
- Conversation entries only relate `sender` to the `users` collection, so customer replies lack a valid reference and break serialization/UI rendering.
- Staff ACLs require `staff === user.id`, preventing chefs/cleaning/security from updating or claiming new tickets.
- No server-side filtering for staff views, risking irrelevant tickets appearing once a staff dashboard exists.
- Optional media uploads are defined, but neither the API nor UI expose attachments, leaving inconsistent expectations.

## Proposed Changes

### 1. Payload Schema & Access Control
- Fix the support ticket `type` select options so each label maps to a unique value (`maintenance` instead of `manager`).
- Update `conversation.sender` to accept both customers and users (`relationTo: ['customers', 'users']`) and add discriminators for UI rendering.
- Allow staff roles to update tickets when `staff` is `null` or matches their ID, while filtering by ticket `type` + associated properties.
- Introduce hooks or field-level validation to enforce that only appropriate roles can be assigned to a ticket based on `type`.
- Add optional `attachments` field per conversation entry if we intend to support multiple media uploads (or confirm single upload suffices).

### 2. API Enhancements
- Extend `/api/custom/customers/support/tickets` POST handler to accept media (multipart) or establish a separate upload endpoint.
- When customers send messages, persist `sender` with both `relationTo` and `value`, and store `updatedAt` timestamps consistently.
- Provide staff-facing APIs (e.g., `/api/custom/staff/support/tickets`) that enforce role-based filtering: only tickets matching staff role (and optionally property mapping) are returned.
- Add endpoints for ticket assignment (`PATCH /tickets/{id}/assign`) and status transitions with audit entries in `progress`.
- Harden rate limiting per role and include pagination for staff/admin ticket lists.

### 3. Frontend (Customer & Staff Dashboards)
- Update the customer `SupportCenter` to handle the corrected schema (including `sender` union objects) and expose media attachments.
- Add UI affordances for customers to upload optional images/files when creating tickets or replying.
- Build a staff dashboard module that displays role-filtered tickets, allows claiming/unassigning, updating status, and posting responses.
- Introduce manager/admin views for assigning tickets manually and monitoring `progress` history.
- Ensure status badges and history reflect `progress` entries, not just the current state.

### 4. Documentation & Testing
- Document the end-to-end support workflow (customers → staff → resolution) in `docs/DEVELOPMENT.md` or a dedicated support guide.
- Add API reference updates covering new staff endpoints, assignment rules, and attachment handling.
- Create automated tests (unit + integration/E2E) for ticket creation, messaging, assignment, and closure scenarios.
- Provide seeding scripts/fixtures reflecting the new schema (including mixed sender conversations and attachments).

## Task Checklist
- [x] Update `SupportTickets` collection schema (type values, conversation sender relation, ACL tweaks, validation hooks).
- [x] Adjust `payload-types.ts` regeneration and ensure generated types cover new conversation union structure.
- [x] Implement customer API changes for message creation, timestamps, and optional attachments.
- [x] Implement staff/admin support APIs with role-based filtering, assignment, and status transitions.
- [x] Enhance customer dashboard UI for media uploads and resilient conversation rendering.
- [x] Build staff dashboard components for ticket queues, assignment, and response workflows.
- [x] Build complete staff portal with authentication (login, logout, session management).
- [x] Add staff ticket list page with filtering (all, unassigned, mine, by status).
- [x] Add staff ticket detail page with conversation view and reply functionality.
- [x] Implement claim/unassign functionality for staff ticket management.
- [x] Add file upload capability to customer ticket creation and replies (with multipart/form-data support).
- [x] Create backend APIs for file uploads to support-media collection.
- [x] Create manager/admin reassignment API endpoint.
- [x] Create staff list API for manager/admin tooling.
- [x] Complete manager/admin reassignment UI in staff portal (dialog with staff dropdown, notes).
- [x] Add progress history timeline view for managers (collapsible sidebar section with visual timeline).
- [x] Add progress history view for customers (simple status history list in ticket dialog).
- [x] Update seeding logic to generate conversation histories with both customers and staff plus sample attachments.
- [ ] Write automated tests covering customer creation/respond flows, staff assignment actions, and ACL enforcement.
- [x] Update documentation across `docs/API.md` and `docs/DEVELOPMENT.md`; add dedicated support flow guide if needed.

## Implementation Summary

### Completed Features
1. **Schema & ACL Fixes**
   - Fixed maintenance type value mapping
   - Polymorphic conversation sender and progress updatedBy
   - Role-based filtering with OR queries for staff
   - Validation hooks for type/role matching

2. **Customer Features**
   - File upload support in ticket creation
   - File upload support in message replies
   - Multipart/form-data handling in APIs
   - Image storage in support-media collection
   - Polymorphic sender handling in UI

3. **Staff Portal**
   - Complete authentication (login/logout/session)
   - Role-based dashboard with statistics
   - Tickets list with filtering tabs
   - Ticket detail with conversation and actions
   - Claim/unassign functionality

4. **Manager/Admin APIs**
   - Reassignment endpoint (`/api/custom/staff/support/tickets/[id]/reassign`)
   - Staff list endpoint (`/api/custom/staff/users`)
   - Role validation for reassignment

5. **Manager/Admin UI**
   - Reassignment dialog in staff ticket detail page
   - Staff member dropdown with role display
   - Optional note field for reassignment audit
   - Only accessible to managers and admins
   - Progress entries logged automatically

6. **Progress History Visualization**
   - **Staff Portal (Manager/Admin):**
     - Collapsible timeline in ticket sidebar
     - Visual timeline with status dots
     - Shows timestamp, status, updater (name + role), and notes
     - Reverse chronological order (newest first)
     - Max height with scroll for long histories
   - **Customer Portal:**
     - Simple status history list in ticket dialog
     - Shows all progress entries with timestamps
     - Displays notes when available
     - Compact card layout

### Remaining Work
1. **Automated Testing**
   - E2E tests for customer ticket creation with file uploads
   - E2E tests for staff assignment and messaging workflows
   - Unit tests for ACL enforcement rules

2. **Automated Testing**
   - E2E tests for customer ticket creation flow
   - E2E tests for staff assignment and messaging
   - Unit tests for ACL enforcement
   - Integration tests for file uploads

### Notes
- All backend APIs are functional and documented
- File upload size limit: 5MB
- Supported file types: images only
- Rate limiting: 200 requests per 15 minutes per IP
