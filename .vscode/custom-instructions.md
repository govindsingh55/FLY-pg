
## Copilot Custom Instructions for FLY-pg Project

### Project Overview
This project is a PG/hostel management platform for working professionals. It enables property management, booking, support, and service workflows for admins, staff, and customers.

**Status:**
- User roles, authentication, and core Payload CMS collections are implemented and tested.
- Current focus: property listing/filtering UI, booking flow, manager/staff dashboards, support ticket system, check-in/out tracking, media management, and comprehensive testing.

### User Roles & Permissions
- **[DONE]** All user roles and permissions are implemented with Payload CMS access control.
- **Admin (Super Admin):** Full access to all features and data.
- **Staff:**
  - **Manager:** Manages staff, property info, images, amenities, food menu, rooms, charges. Handles bookings and customer contact.
  - **Chef:** Manages food/menu, responds to food/chef-related support tickets.
  - **Cleaning Service:** Manages cleaning-related support tickets.
  - **Security:** Manages daily user check-in/out records for security.
- **Customer (Working Professional):** Can browse properties, filter by location/amenities/price, view details, book rooms/food, or schedule visits. Can raise support tickets to relevant staff.

### Core Features
- [DONE] User roles, authentication, and all core collections
- [IN PROGRESS] Property listing and filtering (location, amenities, price)
- [IN PROGRESS] Property detail view (rooms, rent, food info, images)
- [IN PROGRESS] Room booking (with/without food), visit scheduling
- [IN PROGRESS] Booking management and confirmation by manager
- [IN PROGRESS] Support ticket system (manager, chef, cleaning, maintenance)
- [IN PROGRESS] Staff management (manager oversees staff roles)
- [IN PROGRESS] Daily user check-in/out tracking (security)
- [IN PROGRESS] Media management (property images, food menu)

### Required Collections (Payload CMS)
- **[DONE]** All required collections are created and access logic is implemented:
  - Users, Properties, Index, Bookings, Food Menu, Support Tickets, Staff, Check-in/Check-out Logs

### Auth & Authorization
- **[DONE]** Role-based access control for all collections and endpoints
- Only admins/managers can edit property/room/menu info
- Staff access limited to their responsibilities (chef, cleaning, security)
- Customers can book, view, and raise tickets; cannot access staff/admin features

### File Organization
- Frontend: `src/app/(frontend)/`
- Backend/Payload: `src/app/(payload)/`, `src/payload.config.ts`
- Collections: `src/collections/`
- Fields: `src/fields/`
- Access logic: `src/access/`
- Components: `src/components/`
- Utilities: `src/utilities/`
- Media: `public/media/`

### Coding Standards
- Use TypeScript for all new code
- Use Tailwind CSS for styling; avoid custom CSS unless necessary
- Use functional React components and hooks
- Lint and format code per ESLint/Prettier config

### Testing
- Vitest for unit/integration tests (`tests/int/`)
- Playwright for end-to-end tests (`tests/e2e/`)
- All new features must include relevant tests
- **Current focus:** Increase test coverage for new and existing features.

### Environment & Deployment
- Environment variables: `.env`, `test.env`
- Docker for local development/deployment (`Dockerfile`, `docker-compose.yml`)

### General Guidance
- Document major changes/features in `README.md`
- Prefer reusing existing components/utilities
- Ensure accessibility and SEO best practices
- Refer to `docs/todo.md` for current priorities and progress.

### Do not
- Do not commit secrets or sensitive data
- Do not use deprecated APIs/libraries
- Do not modify files outside project scope unless explicitly requested
