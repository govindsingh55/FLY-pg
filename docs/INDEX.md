# Documentation Index

Quick reference guide to all documentation files for the FLY-PG-v2 Property Management System.

---

## 📚 Core Documentation

### [README.md](file:///c:/dev/FLY-pg-v2/docs/README.md)

**Main documentation hub with:**

- Technology stack overview
- Project structure
- Quick start guide
- Development commands
- User roles summary
- Key features overview
- External links to frameworks and tools

**Start here** if you're new to the project.

---

### [ARCHITECTURE.md](file:///c:/dev/FLY-pg-v2/docs/ARCHITECTURE.md)

**System architecture and development standards:**

- Drizzle ORM with RQB v2 standard
- Remote Functions pattern overview
- Role-based access control (RBAC) structure
- Better-Auth authentication setup
- Development best practices

For understanding **how the system works**.

---

### [DATABASE.md](file:///c:/dev/FLY-pg-v2/docs/DATABASE.md)

**Complete database schema reference:**

- All 22 tables with column definitions
- Data types and constraints
- Relationships and foreign keys
- Indexes and unique constraints
- Entity relationship diagrams
- Soft delete patterns

For **database structure** and **data models**.

---

### [FEATURES.md](file:///c:/dev/FLY-pg-v2/docs/FEATURES.md)

**Detailed feature documentation by portal:**

- Admin Portal features (properties, customers, bookings, contracts, etc.)
- Customer Portal features (dashboard, tickets, payments)
- Staff Portal features (assigned tasks)
- Role-based access control details
- UI component usage

For understanding **what the system can do**.

---

### [API-PATTERNS.md](file:///c:/dev/FLY-pg-v2/docs/API-PATTERNS.md)

**Remote Functions pattern and API architecture:**

- Query and Form functions explained
- Drizzle RQB v2 syntax examples
- Authentication and authorization patterns
- Validation with Zod schemas
- Error handling best practices
- Pagination and search patterns
- CRUD operation examples

For **implementing new features** and **API design**.

---

### [PROGRESS.md](file:///c:/dev/FLY-pg-v2/docs/PROGRESS.md)

**Project status and roadmap:**

- Completed features checklist
- Current implementation status
- Future enhancements planned
- Recent updates and changes
- Code quality metrics
- Statistics (routes, tables, schemas)

For tracking **project progress** and **what's next**.

---

## 🛠️ Technical Resources

### [shadcn-svelte.llm.txt](file:///c:/dev/FLY-pg-v2/docs/shadcn-svelte.llm.txt)

**UI component library reference:**

- Shadcn-Svelte component documentation
- Usage examples and patterns
- Component customization guide

For **building UI components**.

---

## 📖 Reading Order for New Developers

### Beginner Path

1. **[README.md](file:///c:/dev/FLY-pg-v2/docs/README.md)** - Get familiar with the project
2. **[FEATURES.md](file:///c:/dev/FLY-pg-v2/docs/FEATURES.md)** - Understand what the system does
3. **[DATABASE.md](file:///c:/dev/FLY-pg-v2/docs/DATABASE.md)** - Learn the data structure
4. **[API-PATTERNS.md](file:///c:/dev/FLY-pg-v2/docs/API-PATTERNS.md)** - See code examples

### Advanced Path

1. **[ARCHITECTURE.md](file:///c:/dev/FLY-pg-v2/docs/ARCHITECTURE.md)** - Understand design decisions
2. **[API-PATTERNS.md](file:///c:/dev/FLY-pg-v2/docs/API-PATTERNS.md)** - Master implementation patterns
3. **[DATABASE.md](file:///c:/dev/FLY-pg-v2/docs/DATABASE.md)** - Deep dive into schema design
4. **[PROGRESS.md](file:///c:/dev/FLY-pg-v2/docs/PROGRESS.md)** - Identify areas to contribute

---

## 🔍 Quick Lookup

### Need to...

**Set up the project?**  
→ [README.md - Quick Start](file:///c:/dev/FLY-pg-v2/docs/README.md#quick-start)

**Understand authentication?**  
→ [ARCHITECTURE.md - Authentication](file:///c:/dev/FLY-pg-v2/docs/ARCHITECTURE.md#authentication)

**Find a table schema?**  
→ [DATABASE.md](file:///c:/dev/FLY-pg-v2/docs/DATABASE.md)

**Implement a new feature?**  
→ [API-PATTERNS.md - Best Practices](file:///c:/dev/FLY-pg-v2/docs/API-PATTERNS.md#best-practices)

**Learn about roles?**  
→ [ARCHITECTURE.md - RBAC](file:///c:/dev/FLY-pg-v2/docs/ARCHITECTURE.md#role-based-access-control-rbac)  
→ [README.md - User Roles](file:///c:/dev/FLY-pg-v2/docs/README.md#user-roles)

**Understand Remote Functions?**  
→ [API-PATTERNS.md - Remote Functions Pattern](file:///c:/dev/FLY-pg-v2/docs/API-PATTERNS.md#remote-functions-pattern)

**See what's been built?**  
→ [PROGRESS.md - Completed Features](file:///c:/dev/FLY-pg-v2/docs/PROGRESS.md#completed-features)

**Find UI components?**  
→ [shadcn-svelte.llm.txt](file:///c:/dev/FLY-pg-v2/docs/shadcn-svelte.llm.txt)

---

## 🔗 External Resources

### Official Documentation

- [SvelteKit](https://kit.svelte.dev/docs)
- [Svelte 5](https://svelte.dev/docs/svelte/overview)
- [Drizzle ORM](https://orm.drizzle.team)
- [Better-Auth](https://www.better-auth.com/docs)
- [Shadcn-Svelte](https://www.shadcn-svelte.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Zod](https://zod.dev)

### Code Examples

- Property Management: [src/routes/admin/properties](file:///c:/dev/FLY-pg-v2/src/routes/admin/properties)
- Remote Functions: [bookings.remote.ts](file:///c:/dev/FLY-pg-v2/src/routes/admin/bookings/bookings.remote.ts)
- Database Schema: [schema.ts](file:///c:/dev/FLY-pg-v2/src/lib/server/db/schema.ts)
- Validation Schemas: [src/lib/schemas](file:///c:/dev/FLY-pg-v2/src/lib/schemas)

---

## 📦 Project Files

### Main README

**[Project Root README](file:///c:/dev/FLY-pg-v2/README.md)** - Project overview from repository root

### Configuration Files

- [package.json](file:///c:/dev/FLY-pg-v2/package.json) - Dependencies and scripts
- [tsconfig.json](file:///c:/dev/FLY-pg-v2/tsconfig.json) - TypeScript configuration
- [svelte.config.js](file:///c:/dev/FLY-pg-v2/svelte.config.js) - SvelteKit configuration
- [drizzle.config.ts](file:///c:/dev/FLY-pg-v2/drizzle.config.ts) - Database configuration

---

## 💡 Tips

- **Use Ctrl+F** to search within documentation files
- **Follow file links** in markdown to navigate to source code
- **Check PROGRESS.md** regularly for recent updates
- **Refer to API-PATTERNS.md** when implementing new features
- **Study DATABASE.md** before making schema changes

---

## 🤝 Contributing to Documentation

When adding features, update:

1. **FEATURES.md** - Add feature description
2. **DATABASE.md** - If adding/modifying tables
3. **API-PATTERNS.md** - If introducing new patterns
4. **PROGRESS.md** - Mark feature as completed
5. **This INDEX** - If adding new documentation files

Keep documentation:

- ✅ Clear and concise
- ✅ Up to date with code
- ✅ With working file links
- ✅ Organized by topic
- ✅ Example-driven

---

Last Updated: December 2025
