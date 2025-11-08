

# FLY-pg - Property Management System

> **Production Ready** · Last updated: November 2025

FLY-pg is a modern, full-stack property management system for PG (Paying Guest) accommodations. It automates bookings, rent reminders, payments (PhonePe), and customer support, with a robust admin panel and customer dashboard.

---

## 🚦 Project Status

- **All core features implemented**
- **Critical bugs fixed and validated**
- **API and UI refactored for paymentType and booking logic**
- **Documentation fully consolidated**
- **Ready for production deployment**

---

## �️ Tech Stack

- **Frontend:** Next.js 14+, React, TypeScript, Tailwind CSS
- **Backend:** Payload CMS v3+, MongoDB
- **Payments:** PhonePe SDK (UPI, cards, net banking)
- **Email:** Resend API
- **Testing:** Playwright, Vitest
- **Deployment:** Docker, Dokploy

---

## 📂 Folder Structure

```
src/
	app/           # Next.js app router (frontend, admin, API)
	components/    # React components (dashboard, UI, marketing)
	hooks/         # Custom React hooks
	payload/       # Payload CMS config (collections, jobs, admin)
	lib/           # Utilities and services
	types/         # TypeScript types
docs/            # Documentation (see below)
scripts/         # Automation scripts
media/           # Persistent media storage
tests/           # Unit and E2E tests
```

---

## 📚 Documentation

- [docs/SETUP.md](docs/SETUP.md) — Setup & deployment
- [docs/API.md](docs/API.md) — API reference
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — Development guide
- [docs/RENT_REMINDERS.md](docs/RENT_REMINDERS.md) — Rent reminder system
- [docs/SECURITY.md](docs/SECURITY.md) — Security best practices

---

## 🚀 Quick Start

1. **Install dependencies:** `npm install`
2. **Configure environment:** Copy `.env.example` to `.env` and update values
3. **Start dev server:** `npm run dev`
4. **Access:**
	 - Frontend: [http://localhost:3000](http://localhost:3000)
	 - Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
5. **Seed data:** Use "Seed Test Data" in admin or `curl -X POST http://localhost:3000/api/seed`

For full setup, see [docs/SETUP.md](docs/SETUP.md)

---

## 💳 Payments & Rent Reminders

- **Automated rent reminders**: Monthly job creates rent invoices and sends notifications
- **PhonePe integration**: UPI, cards, net banking (UAT and production ready)
- **Manual/cash payments**: Record via admin panel
- **Payment types**: rent, electricity, security-deposit, late-fee, other
- **Critical bug fixes**: Duplicate invoice prevention, food calculation, payment filtering, inactive booking guards ([details](docs/RENT_REMINDERS.md#🐛-critical-bug-fixes-2025-refactor))

---

## 🧑‍💻 Contributing & Support

1. Fork the repo & create a feature branch
2. Make changes and add tests
3. Submit a pull request

**License:** MIT

For help, see the [docs](docs/), open an issue, or check the admin panel for troubleshooting.

---

**Built with ❤️ using Next.js, Payload CMS, and PhonePe**

src/

---


---


---


---

docker run -p 3000:3000 fly-pg

---


---


---


---


---


---

**All dashboard tasks completed. System is production ready.** ✅