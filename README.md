# Property Management System (PMS)

A comprehensive property management solution built with SvelteKit, featuring admin and customer portals for managing properties, bookings, payments, and maintenance tickets.

## Features

### Admin Portal (`/admin/*`)

- **Properties & Rooms Management**: Add, edit, and manage properties with multiple rooms
- **Customer Management**: Track tenant profiles and booking history
- **Booking System**: Create and manage room reservations
- **Payment Tracking**: Record and monitor rent and deposit payments
- **Ticket Management**: View and respond to maintenance requests

### Customer Portal (`/dashboard/*`)

- **Personal Dashboard**: View current booking and account status
- **Ticket System**: Report maintenance issues
- **Payment History**: Track all past payments
- **Notifications**: Stay updated on system events

## Tech Stack

- **Framework**: SvelteKit
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Better-Auth
- **UI Components**: Shadcn Svelte
- **Validation**: Zod
- **Styling**: TailwindCSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd FLY-pg-v2
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env` file in the root directory:

```env
DB_FILE_NAME=./sqlite.db
BETTER_AUTH_SECRET=your-secret-key-here
```

4. Initialize the database

```bash
npm run db:push
```

5. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── lib/
│   ├── components/ui/     # Shadcn Svelte components
│   ├── schemas/           # Zod validation schemas
│   ├── server/
│   │   ├── db/           # Database schema and config
│   │   └── auth.ts       # Better-Auth configuration
│   └── auth-client.ts    # Frontend auth client
├── routes/
│   ├── admin/            # Admin portal routes
│   ├── dashboard/        # Customer portal routes
│   ├── login/            # Authentication pages
│   └── signup/
└── app.css               # Global styles
```

## Database Schema

### Core Tables

- `user` - Authentication and user profiles
- `properties` - Property listings
- `rooms` - Individual rooms within properties
- `customers` - Tenant profiles
- `bookings` - Room reservations
- `payments` - Payment records
- `tickets` - Maintenance requests
- `notifications` - User notifications

## User Roles

- **admin**: Full system access
- **manager**: Property and booking management
- **staff**: Limited admin access
- **customer**: Tenant portal access

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

### Adding New Features

1. Define Zod schema in `src/lib/schemas/`
2. Create route in `src/routes/`
3. Add server logic in `+page.server.ts`
4. Build UI in `+page.svelte`

## Authentication Flow

1. Users sign up at `/signup`
2. Login at `/login`
3. Customers redirected to `/dashboard`
4. Admin users access `/admin` (role-protected)

## Deployment

1. Build the application:

```bash
npm run build
```

2. Set production environment variables
3. Deploy the `build` directory to your hosting platform

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
