# Payload Blank Template

This template comes configured with the bare minimum to get started on anything you need.

## Quick start

This template can be deployed directly from our Cloud hosting and it will setup MongoDB and cloud S3 object storage for media.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. `cd my-project && cp .env.example .env` to copy the example environment variables. You'll need to add the `MONGODB_URI` from your Cloud project to your `.env` if you want to use S3 storage and the MongoDB database that was created for you.

3. `pnpm install && pnpm dev` to install dependencies and start the dev server
4. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

#### Docker (Optional)

If you prefer to use Docker for local development instead of a local MongoDB instance, the provided docker-compose.yml file can be used.

To do so, follow these steps:

- Modify the `MONGODB_URI` in your `.env` file to `mongodb://127.0.0.1/<dbname>`
- Modify the `docker-compose.yml` file's `MONGODB_URI` to match the above `<dbname>`
- Run `docker-compose up` to start the database, optionally pass `-d` to run in the background.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).

## Property booking feature plan

This section tracks the implementation plan for room booking and payments from the Property Details page.

- [x] Replace room list with selectable room UI on the property page (in `BookingCard.tsx`).
- [x] Enable the Book button only when a room is selected.
- [x] On Book, open Drawer/Sheet similar to Schedule a visit.
- [x] Prevent guests from booking; show a modal prompting Sign in / Sign up.
- [x] Booking form to capture minimal inputs (foodIncluded) and submit to API.
- [x] Create endpoint POST `/api/custom/booking` to create a booking.
- [x] Compute price server-side from the selected room; store `roomSnapshot`.
- [x] Seed payment handling: create a pending Payment tied to the booking with due date.
- [ ] Extend price rules (e.g., add food plan cost, discounts, taxes).
- [ ] Payment UI flow (choose method, pay now, handle callbacks) and success page.
- [ ] Wire PhonePe env vars and signature verification utilities.
- [ ] Implement PhonePe initiation, redirect/instrument handling, callback + webhook.
- [ ] Update Payment and Booking status transitions automatically.

## PhonePe integration (planned steps)

Environment variables (example)
- PHONEPE_MERCHANT_ID=
- PHONEPE_SALT_KEY=
- PHONEPE_KEY_INDEX=1
- PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
- NEXT_PUBLIC_SITE_URL=https://your-site.example
  # For local/dev with Next.js default
  # NEXT_PUBLIC_SITE_URL can be http://localhost:3000

End-to-end flow
1) Create booking + pending payment (done) via POST `/api/custom/booking`.
2) Initiate PhonePe (stubbed now): POST `/api/custom/payments/phonepe/initiate`.
  - Build payload, base64 encode, compute checksum (see `src/lib/payments/phonepe.ts`).
  - Send to PhonePe create endpoint; persist transaction/orderId.
  - Return redirectUrl/instrument for client.
3) Client redirects to PhonePe or opens app intent.
4) Redirect/Callback on return (add a client route to read query, optional):
  - Server callback: POST `/api/custom/payments/phonepe/callback` validates signature and updates DB.
  - Optional status poll: GET `/api/custom/payments/phonepe/status?paymentId=...` (done).
5) Mark payment completed and booking confirmed.
6) Redirect to `/payments/success?paymentId=...&bookingId=...` (page added).

Files
- `src/components/marketing/property-detail/RoomBookingForm.tsx` — multi-step booking/payment UI.
- `src/app/api/custom/booking/route.ts` — creates booking + pending payment.
- `src/app/api/custom/payments/phonepe/initiate/route.ts` — start transaction (stub export).
- `src/app/api/custom/payments/phonepe/complete/route.ts` — dev-only to mark success (export).
- `src/app/api/custom/payments/phonepe/status/route.ts` — status lookup (export).
- `src/app/api/custom/payments/phonepe/callback/route.ts` — server callback/webhook (export).
- `src/app/(frontend)/payments/success/page.tsx` — success view for QA.
- `src/lib/payments/phonepe.ts` — checksum/base64 helpers.

- [ ] Booking lifecycle updates (confirm, cancel) and admin workflows.

Notes
- Guests can still schedule a visit, but must sign in or sign up to book.
- Payments are created as `pending` by the API to prepare for the actual payment flow hookup.
- When the real payment gateway is integrated, update the API to create payment intents/sessions and redirect the user accordingly.
