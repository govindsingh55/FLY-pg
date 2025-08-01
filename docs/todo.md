# Project TODOs for FLY-pg

**Status:**
- User roles, authentication, and all core Payload CMS collections are complete and tested.
- Current focus: property listing/filtering UI, booking flow, manager/staff dashboards, support ticket system, check-in/out tracking, media management, and comprehensive testing.

## 1. Set Up User Roles & Authentication ✅
- **[DONE]** Role-based access for Admin, Staff (Manager, Chef, Cleaning, Security), and Customer.
- **[DONE]** Secure registration, login, and password management.
- **[DONE]** Payload CMS access control, tested all role restrictions, no sensitive endpoints exposed.

## 2. Create Core Collections in Payload CMS ✅
- **[DONE]** Users, Properties, Index, Bookings, Food Menu, Support Tickets, Staff, Check-in/Check-out Logs.
- **[DONE]** Fields, relationships, and access logic for each collection.
- **[DONE]** Data validation, required fields, unique constraints, role-based permissions.

## 3. Property Listing & Filtering (Frontend)
- Build UI for browsing/filtering properties by location, amenities, price. **[IN PROGRESS]**
- Connect to backend for dynamic data. **[IN PROGRESS]**
- Consider: Fast search/filter UX, accessibility, SEO, mobile responsiveness.

## 4. Property Detail & Booking Flow
- Show property details, available rooms, rent, food info, images. **[IN PROGRESS]**
- Implement booking (room, food, visit scheduling) with optional payment. **[IN PROGRESS]**
- Consider: Booking validation, availability checks, error handling, confirmation flow.

## 5. Booking Management (Manager)
- Manager dashboard to view, confirm, and manage bookings. **[IN PROGRESS]**
- Contact customers for booking confirmation. **[IN PROGRESS]**
- Consider: Notification system, booking status updates, audit logs.

## 6. Support Ticket System
- Allow customers to raise tickets to manager, chef, cleaning, maintenance. **[IN PROGRESS]**
- Staff dashboard for ticket management and response. **[IN PROGRESS]**
- Consider: Ticket categorization, status tracking, notifications, response history.

## 7. Staff Management
- Manager can add/edit/delete staff profiles and assign roles. **[IN PROGRESS]**
- Consider: Role assignment UI, staff permissions, audit logs.

## 8. Daily Check-in/Check-out Tracking (Security)
- Log user movement for security staff. **[IN PROGRESS]**
- UI for viewing and exporting logs. **[IN PROGRESS]**
- Consider: Privacy, data retention, export formats.

## 9. Media Management
- Upload and manage property images, food menu images. **[IN PROGRESS]**
- Consider: File size limits, image optimization, access control.

## 10. Testing & Quality Assurance
- Write unit/integration tests (Vitest) and e2e tests (Playwright). **[IN PROGRESS]**
- Test all major features and edge cases. **[IN PROGRESS]**
- Consider: Test coverage, CI integration, test data management.

## 11. Environment & Deployment
- Set up environment variables, Docker for local/dev/prod.
- Consider: Secure secrets, deployment scripts, rollback strategy.

## 12. Documentation
- Document major features, API endpoints, and workflows in README.md and docs.
- Consider: Update docs with every major change, onboarding guide for new devs.

## 13. Accessibility & SEO
- Ensure all frontend components are accessible and SEO-optimized.
- Consider: ARIA roles, semantic HTML, meta tags, alt text for images.

## 14. General Best Practices
- Reuse existing components/utilities where possible.
- Avoid deprecated APIs/libraries.
- Do not commit secrets or sensitive data.
- Do not modify files outside project scope unless explicitly requested.

---
Refer to `.vscode/custom-instructions.md` for coding standards and project guidance.
