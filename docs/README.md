# FLY-PG-v2 Documentation

Welcome to the comprehensive documentation for the **Property Management System (PMS)**.

## 📚 Documentation Index

### Getting Started

- **[Main README](file:///c:/dev/FLY-pg-v2/README.md)** - Project overview and setup instructions
- **[Quick Start](#quick-start)** - Get up and running quickly

### Core Documentation

- **[ARCHITECTURE](file:///c:/dev/FLY-pg-v2/docs/ARCHITECTURE.md)** - System architecture and development standards
- **[DATABASE](file:///c:/dev/FLY-pg-v2/docs/DATABASE.md)** - Complete database schema reference
- **[FEATURES](file:///c:/dev/FLY-pg-v2/docs/FEATURES.md)** - All features by portal and role
- **[API-PATTERNS](file:///c:/dev/FLY-pg-v2/docs/API-PATTERNS.md)** - Remote Functions pattern and API architecture
- **[PROGRESS](file:///c:/dev/FLY-pg-v2/docs/PROGRESS.md)** - Implementation status and roadmap

### Technical Resources

- **[Shadcn-Svelte Guide](file:///c:/dev/FLY-pg-v2/docs/shadcn-svelte.llm.txt)** - UI component reference

---

## 🏗️ Technology Stack

### Core Framework

- **[SvelteKit](https://kit.svelte.dev/docs/introduction)** - Full-stack meta-framework
  - Server-side rendering (SSR)
  - File-based routing
  - API endpoints

### Database & ORM

- **[SQLite](https://www.sqlite.org/docs.html)** - Lightweight database
- **[Drizzle ORM](https://orm.drizzle.team/docs/overview)** - Type-safe ORM
  - **[Relational Query Builder (RQB)](https://orm.drizzle.team/docs/rqb)** - v2 object syntax
  - **[Schema Definition](https://orm.drizzle.team/docs/sql-schema-declaration)** - TypeScript schema

### Authentication

- **[Better-Auth](https://www.better-auth.com/docs/introduction)** - Auth solution
  - Session management
  - Email verification
  - OAuth (Google/GitHub)
  - Role-based access control

### UI & Styling

- **[Shadcn-Svelte](https://www.shadcn-svelte.com/docs)** - Component library
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Utility-first CSS
- **[Lucide Svelte](https://lucide.dev/guide/packages/lucide-svelte)** - Icons
- **[Bits UI](https://www.bits-ui.com/docs/introduction)** - Headless primitives
- **[Svelte Sonner](https://github.com/wobsoriano/svelte-sonner)** - Toast notifications

### Utilities

- **[Zod](https://zod.dev/)** - Schema validation and type inference

---

## 📁 Project Structure

```
FLY-pg-v2/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── db/
│   │   │   │   └── schema.ts         # Database schema
│   │   │   └── auth.ts               # Auth configuration
│   │   ├── schemas/                  # Zod validation schemas
│   │   ├── components/
│   │   │   └── ui/                   # Shadcn components
│   │   └── auth-client.ts            # Frontend auth client
│   └── routes/
│       ├── admin/                    # Admin portal
│       │   ├── properties/           # Property management
│       │   ├── customers/            # Customer management
│       │   ├── bookings/             # Booking management
│       │   ├── contracts/            # Contract management
│       │   ├── payments/             # Payment tracking
│       │   ├── electricity/          # Electricity billing
│       │   ├── tickets/              # Ticket system
│       │   ├── staff/                # Staff management
│       │   ├── assignments/          # Property assignments
│       │   ├── visits/               # Visit bookings
│       │   ├── amenities/            # Amenities management
│       │   ├── media/                # Media management
│       │   ├── notifications/        # Notifications
│       │   └── settings/             # System settings
│       ├── dashboard/                # Customer portal
│       ├── staff/                    # Staff portal
│       ├── login/                    # Authentication
│       └── signup/
├── scripts/
│   └── seed.ts                       # Database seeding
└── docs/                             # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (or Bun)
- **npm** or **pnpm**

### Installation

1. **Clone Repository**:

   ```bash
   git clone <repository-url>
   cd FLY-pg-v2
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:

   Create a `.env` file (copy from `.env.example`):

   ```env
   DB_FILE_NAME=./mydb.sqlite
   BETTER_AUTH_SECRET=your-secret-key-here
   ```

4. **Database Setup**:

   ```bash
   # Push schema to database
   npm run db:push

   # (Optional) Seed with test data
   npm run db:seed
   ```

5. **Start Development Server**:

   ```bash
   npm run dev
   ```

   Access the app at `http://localhost:5173`

---

## 🛠️ Development Commands

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Start development server with hot reload |
| `npm run build`       | Build for production                     |
| `npm run preview`     | Preview production build                 |
| `npm run check`       | Run Svelte type checking                 |
| `npm run lint`        | Run ESLint and Prettier checks           |
| `npm run format`      | Format code with Prettier                |
| `npm run db:push`     | Push schema changes to database          |
| `npm run db:generate` | Generate migration files                 |
| `npm run db:migrate`  | Apply migrations                         |
| `npm run db:studio`   | Open Drizzle Studio (database GUI)       |
| `npm run db:seed`     | Populate database with test data         |

---

## 👥 User Roles

### Admin

- Full system access
- Manage all properties, users, and settings
- System configuration

### Manager

- Operational access
- Manage properties, bookings, and staff
- Similar to admin without system settings

### Property Manager

- Property-scoped access
- Manage assigned properties only
- Handle customers, bookings, and maintenance for assigned properties

### Staff

- Task-based access
- **Chef**: Food service management
- **Janitor**: Maintenance tickets
- **Security**: Visitor logs and security tickets

### Customer

- Personal account access
- View bookings and contracts
- Make payments
- Submit tickets

---

## 🔑 Key Features

### Property Management

- Property listings with full details
- Room management within properties
- Media uploads (images, documents)
- Amenities assignment
- Location tracking

### Customer & Booking Management

- Customer profiles with ID verification
- Room booking system
- Visit scheduling for prospective tenants
- Contract generation from bookings

### Financial Management

- Payment tracking (rent, deposits, utilities)
- Electricity billing with meter readings
- Multiple payment modes (cash, online, UPI)
- Transaction history

### Maintenance & Support

- Ticket system with chat threads
- Staff assignment to tickets
- Priority and status tracking
- Customer-staff communication

### Staff Management

- Staff profiles (chef, janitor, security)
- Property assignments
- Role-based access control

### Notifications

- System-wide notifications
- Type-based categorization (rent, electricity, etc.)
- Read/unread tracking

---

## 📖 Learn More

- **Architecture**: Read [ARCHITECTURE.md](file:///c:/dev/FLY-pg-v2/docs/ARCHITECTURE.md) for development standards
- **Database**: See [DATABASE.md](file:///c:/dev/FLY-pg-v2/docs/DATABASE.md) for complete schema reference
- **Features**: Check [FEATURES.md](file:///c:/dev/FLY-pg-v2/docs/FEATURES.md) for detailed feature documentation
- **API Patterns**: Review [API-PATTERNS.md](file:///c:/dev/FLY-pg-v2/docs/API-PATTERNS.md) for Remote Functions pattern

---

## 🔗 External Documentation Links

### Framework & Tools

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Zod Documentation](https://zod.dev)

### UI & Styling

- [Shadcn-Svelte Documentation](https://www.shadcn-svelte.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [Bits UI Documentation](https://www.bits-ui.com)

---

## 📝 License

MIT

## 🤝 Support

For issues and questions, please open an issue on GitHub.
