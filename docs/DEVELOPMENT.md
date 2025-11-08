# Development Guide

> **Last Updated**: January 2025  
> **Project**: FLY-pg Property Management System

---

## 📚 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Payload Collections](#payload-collections)
- [Payment System](#payment-system)
- [Booking Workflow](#booking-workflow)
- [Hooks & Validation](#hooks--validation)
- [API Development](#api-development)
- [Recent Refactoring](#recent-refactoring)
- [Development Guidelines](#development-guidelines)

---

## 🎯 Project Overview

FLY-pg is a comprehensive property management system for PG (Paying Guest) accommodations built with modern web technologies. It handles property listings, customer bookings, automated rent reminders, payment processing via PhonePe, and customer support.

### **Core Features**
- **Property Management**: Properties, rooms, amenities
- **Booking System**: Complete booking lifecycle with status tracking
- **Payment Processing**: PhonePe integration + manual payment recording
- **Automated Billing**: Monthly rent reminders with intelligent duplicate prevention
- **Customer Dashboard**: Profile management, payment history, support tickets
- **Admin Panel**: PayloadCMS-powered admin interface

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Type Safety**: TypeScript

### **Backend**
- **CMS**: Payload CMS v3+
- **Database**: MongoDB
- **API**: Next.js API Routes
- **Authentication**: JWT (Payload built-in)

### **Payment Integration**
- **Gateway**: PhonePe SDK
- **Email**: Resend API

### **Testing**
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright
- **Integration Tests**: Vitest + Supertest

---

## 📂 Project Structure

```
c:\dev\FLY-pg\
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (frontend)/              # Public-facing routes
│   │   │   ├── (main)/             # Main pages (home, properties)
│   │   │   └── dashboard/          # Customer dashboard
│   │   ├── (payload)/              # Payload CMS admin routes
│   │   │   └── admin/              # Admin panel
│   │   ├── api/                     # API routes
│   │   │   └── custom/             # Custom API endpoints
│   │   │       ├── booking/        # Booking APIs
│   │   │       ├── customers/      # Customer APIs
│   │   │       ├── jobs/           # Cron job triggers
│   │   │       └── payments/       # Payment APIs
│   │   └── [...slug]/              # Dynamic page routing
│   │
│   ├── components/                  # React components
│   │   ├── dashboard/              # Customer dashboard components
│   │   ├── marketing/              # Marketing page components
│   │   ├── ui/                     # Reusable UI components
│   │   ├── sections/               # Page sections
│   │   └── layout/                 # Layout components
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useDashboard.ts         # Dashboard data & caching
│   │   ├── usePayments.ts          # Payment data & mutations
│   │   ├── useBookings.ts          # Booking data & mutations
│   │   ├── useSettings.ts          # Settings management
│   │   └── ...                     # More hooks
│   │
│   ├── payload/                     # Payload CMS configuration
│   │   ├── collections/            # Collection schemas
│   │   │   ├── Bookings.ts         # Booking records
│   │   │   ├── Payments.ts         # Payment transactions
│   │   │   ├── Customers.ts        # Customer data
│   │   │   ├── Properties.ts       # Property listings
│   │   │   ├── Rooms.ts            # Room inventory
│   │   │   └── ...                 # More collections
│   │   ├── jobs/                   # Background job definitions
│   │   │   └── index.ts            # Rent reminder job
│   │   ├── endpoints/              # Custom Payload endpoints
│   │   └── components/             # Admin UI components
│   │
│   ├── lib/                         # Utility libraries
│   │   ├── utils.ts                # General utilities
│   │   ├── email.ts                # Email service
│   │   └── phonepe.ts              # PhonePe SDK wrapper
│   │
│   └── types/                       # TypeScript type definitions
│       ├── payload-types.ts        # Generated Payload types
│       └── custom.d.ts             # Custom type definitions
│
├── docs/                            # Documentation
│   ├── API.md                      # API reference
│   ├── DEVELOPMENT.md              # This file
│   ├── SETUP.md                    # Setup guide
│   ├── RENT_REMINDERS.md           # Rent reminder system
│   └── SECURITY.md                 # Security guidelines
│
├── scripts/                         # Automation scripts
│   ├── create-sample-payments.js   # Seed payment data
│   ├── trigger-rent-reminders.js   # Manual rent reminder trigger
│   └── README.md                   # Script documentation
│
├── tests/                           # Test files
│   ├── e2e/                        # End-to-end tests
│   └── unit/                       # Unit tests
│
└── media/                           # Media storage
    ├── public/                     # Public uploads
    └── support/                    # Support ticket attachments
```

---

## 🗄️ Payload Collections

### **Core Collections**

#### **Customers**
- **Purpose**: Store customer accounts with authentication
- **Key Fields**: 
  - `name`, `email`, `phone`, `password`
  - `status` (active, inactive, suspended)
  - `notificationPreferences` (email, SMS, push)
  - `autoPaySettings` (enabled, method, frequency)
  - `preferences` (theme, language, timezone)
  - `privacySettings` (profile visibility, data sharing)
- **Authentication**: Built-in Payload auth with JWT
- **Hooks**: Password hashing, email validation

#### **Properties**
- **Purpose**: Define property listings with rooms and amenities
- **Key Fields**: 
  - `name`, `address`, `city`, `propertyType`
  - `foodMenu` (price, description, included)
  - `electricityConfig` (enabled, perUnitCost, meterType)
  - `amenities` (relationship to Amenities collection)
  - `status` (active, inactive, under-maintenance)
- **Relationships**: Has many rooms, amenities
- **Hooks**: Status change validation

#### **Rooms**
- **Purpose**: Individual room inventory with pricing
- **Key Fields**: 
  - `roomNumber`, `roomType`, `roomRent`
  - `capacity`, `floor`, `occupancyStatus`
  - `property` (relationship to Properties)
  - `amenities` (room-specific amenities)
- **Relationships**: Belongs to property, has many bookings
- **Hooks**: Occupancy status auto-update

#### **Bookings**
- **Purpose**: Track customer bookings with pricing and lifecycle
- **Key Fields**: 
  - `customer`, `property`, `room`
  - `checkInDate`, `checkOutDate`
  - `roomRent`, `foodPrice`, `securityDeposit`, `total`
  - `status` (pending, confirmed, active, cancelled, completed)
  - `takeFirstMonthRentOnBooking` (boolean flag)
- **Auto-Population**: Prices pulled from room/property on create
- **Validation**: Date overlap prevention, status transitions
- **Hooks**: `beforeValidate` auto-populates all pricing fields

#### **Payments**
- **Purpose**: Handle all payment transactions with gateway integration
- **Key Fields**: 
  - `customer`, `payfor` (booking reference)
  - `paymentType` (rent, electricity, security-deposit, late-fee, other)
  - `amount`, `status` (pending, completed, failed, notified)
  - `paymentMethod` (UPI, card, cash, etc.)
  - `paymentSource` (phonepe, admin-panel, walk-in)
  - **Rent-specific**: `rent`, `lateFees`, `utilityCharges`
  - **Electricity-specific**: `electricityUnitsConsumed`, `electricityRatePerUnit`, `electricityCharges`, `billingPeriodStart`, `billingPeriodEnd`
  - `bookingSnapshot` (auto-populated from booking)
  - `gateway` (PhonePe transaction details)
- **Validation**: Payment type conditional fields, booking validation
- **Hooks**: 
  - `beforeChange` - Auto-populates rent from booking, calculates electricity charges
  - Validates rent amounts match booking data (warns if mismatch)

---

## 💳 Payment System

### **Payment Types**

1. **Rent Payments** (`paymentType: 'rent'`)
   - Monthly rent charges
   - Includes: base rent + food + utility charges
   - **Excludes**: electricity (billed separately)
   - Auto-created by rent reminder job on 1st of each month
   - Amount = `rent + lateFees + utilityCharges`

2. **Electricity Bills** (`paymentType: 'electricity'`)
   - Separate electricity billing based on actual consumption
   - Includes: meter readings, units consumed, per-unit rate
   - Manual creation by admin after meter reading
   - Amount = `electricityUnitsConsumed × electricityRatePerUnit`

3. **Security Deposit** (`paymentType: 'security-deposit'`)
   - One-time refundable security deposit
   - Captured during booking creation
   - Refunded on checkout (manual process)

4. **Late Fees** (`paymentType: 'late-fee'`)
   - Penalties for overdue payments
   - Manually created by admin
   - Can be combined with rent or standalone

5. **Other** (`paymentType: 'other'`)
   - Miscellaneous charges (damage, extra services, etc.)

### **Payment Workflow**

#### **Automated Rent Payment Creation**
```javascript
// Monthly job runs on 1st of month
// Location: src/payload/jobs/index.ts

1. Fetch all active customers with confirmed bookings
2. Check for existing rent payment for current month
   - Query: { customer, payfor: booking, paymentType: 'rent', paymentForMonthAndYear }
3. If no payment exists:
   a. Calculate amount (rent + food, NO electricity)
   b. Create payment record with status 'notified'
   c. Send email notification (gentle reminder)
   d. Add note: "⚡ Electricity charges are billed separately"
4. If payment exists but overdue (after 7th):
   - Send late payment warning email
```

#### **Manual Electricity Bill Creation**
```javascript
// Admin creates via Payload Admin Panel

1. Admin navigates to /admin/collections/payments
2. Click "Create New"
3. Select paymentType: 'electricity'
4. Form shows electricity-specific fields:
   - electricityUnitsConsumed (required)
   - billingPeriodStart, billingPeriodEnd (optional)
   - meterReadingStart, meterReadingEnd (optional)
5. System auto-populates:
   - electricityRatePerUnit (from property.electricityConfig)
   - electricityCharges (units × rate)
   - amount (same as charges)
6. Save payment → customer gets notification
```

#### **PhonePe Payment Flow**
```javascript
// Customer initiates payment from dashboard

1. Customer selects payment → clicks "Pay Now"
2. Frontend calls POST /api/custom/customers/payments/initiate
   - Includes paymentType, bookingId, amount
3. Backend creates PhonePe payment request
4. Customer redirected to PhonePe gateway
5. PhonePe processes payment
6. PhonePe calls webhook: POST /api/custom/payments/phonepe/callback
7. Backend updates payment status
8. Customer redirected to success/failure page
```

### **Booking Snapshot**
Every payment stores a snapshot of booking data for historical accuracy:
```typescript
bookingSnapshot: {
  roomRent: 10000,          // From booking.roomRent
  foodPrice: 5000,          // From booking.foodPrice (if applicable)
  total: 15000,             // From booking.total
  property: "Property Name",
  room: "Room 101"
}
```

---

## 📅 Booking Workflow

### **Booking Lifecycle**

```
pending → confirmed → active → [cancelled / completed]
```

#### **1. Booking Creation**
- Customer selects property and room
- Frontend calls `POST /api/custom/booking`
- `beforeValidate` hook auto-populates:
  - `roomRent` from selected room
  - `foodPrice` from property food menu (if food service enabled)
  - `securityDeposit` (fixed or multiplier of rent)
  - `bookingCharge` (one-time booking fee)
  - `total` = roomRent + foodPrice + securityDeposit + bookingCharge
- Status set to `pending`

#### **2. Booking Confirmation**
- Admin reviews booking in admin panel
- If approved:
  - Status → `confirmed`
  - Room occupancy updated
  - Customer notified via email
- If rejected:
  - Status → `cancelled`
  - Refund security deposit (if paid)

#### **3. Active Booking**
- On check-in date (or manual activation):
  - Status → `active`
  - Rent reminder job includes this customer
  - Monthly rent payments auto-created

#### **4. Booking Completion**
- On check-out:
  - Status → `completed`
  - Room occupancy freed
  - Security deposit refund initiated
  - Rent reminders stop

---

## 🪝 Hooks & Validation

### **Bookings Collection Hooks**

#### **beforeValidate Hook**
```typescript
// Location: src/payload/collections/Bookings.ts (line 40-130)

beforeValidate: async ({ data, req, operation }) => {
  if (operation === 'create' || operation === 'update') {
    // 1. Auto-populate roomRent from selected room
    if (data.room) {
      const room = await req.payload.findByID({
        collection: 'rooms',
        id: data.room
      });
      data.roomRent = room.roomRent;
    }

    // 2. Auto-populate foodPrice from property
    if (data.property) {
      const property = await req.payload.findByID({
        collection: 'properties',
        id: data.property
      });
      if (property.foodMenu?.included) {
        data.foodPrice = property.foodMenu.price;
      }
    }

    // 3. Calculate security deposit
    if (property.securityDepositType === 'multiplier') {
      data.securityDeposit = data.roomRent * property.securityDepositMultiplier;
    } else {
      data.securityDeposit = property.securityDepositAmount;
    }

    // 4. Set booking charge
    data.bookingCharge = property.bookingCharge || 0;

    // 5. Calculate total
    data.total = data.roomRent + (data.foodPrice || 0) + data.securityDeposit + data.bookingCharge;

    // 6. Set takeFirstMonthRentOnBooking flag
    data.takeFirstMonthRentOnBooking = property.takeFirstMonthRentOnBooking || false;
  }
  
  return data;
}
```

### **Payments Collection Hooks**

#### **beforeChange Hook**
```typescript
// Location: src/payload/collections/Payments.ts (line 800-950)

beforeChange: async ({ data, req, operation }) => {
  // 1. Auto-populate rent from booking for rent payments
  if (data.paymentType === 'rent' && data.payfor) {
    const booking = await req.payload.findByID({
      collection: 'bookings',
      id: data.payfor
    });
    
    // Auto-populate rent if not provided
    if (!data.rent) {
      data.rent = booking.roomRent;
    }
    
    // Validate rent matches booking (warn if mismatch)
    if (data.rent !== booking.roomRent) {
      req.payload.logger.warn(
        `Rent mismatch: Payment rent ${data.rent} != Booking rent ${booking.roomRent}`
      );
    }
    
    // Calculate total amount
    data.amount = data.rent + (data.lateFees || 0) + (data.utilityCharges || 0);
    
    // Auto-populate booking snapshot
    data.bookingSnapshot = {
      roomRent: booking.roomRent,
      foodPrice: booking.foodPrice,
      total: booking.total,
      property: booking.property.name,
      room: booking.room.roomNumber
    };
  }

  // 2. Auto-calculate electricity charges
  if (data.paymentType === 'electricity' && data.electricityUnitsConsumed) {
    // Fetch electricity rate from property
    const booking = await req.payload.findByID({
      collection: 'bookings',
      id: data.payfor
    });
    const property = await req.payload.findByID({
      collection: 'properties',
      id: booking.property
    });
    
    // Auto-populate rate
    data.electricityRatePerUnit = property.electricityConfig.perUnitCost;
    
    // Calculate charges
    data.electricityCharges = data.electricityUnitsConsumed * data.electricityRatePerUnit;
    data.amount = data.electricityCharges;
  }

  return data;
}
```

### **Validation Rules**

#### **Date Validation**
```typescript
// Booking dates must be valid
validate: (val, { data }) => {
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  
  if (checkOut <= checkIn) {
    return 'Check-out date must be after check-in date';
  }
  return true;
}
```

#### **Payment Type Conditional Validation**
```typescript
// Rent amount required for rent payments
validate: (val, { data }) => {
  if (data.paymentType === 'rent' && !val) {
    return 'Rent amount is required for rent payments';
  }
  return true;
}

// Units required for electricity bills
validate: (val, { data }) => {
  if (data.paymentType === 'electricity' && !val) {
    return 'Units consumed is required for electricity bills';
  }
  return true;
}
```

---

## 🔌 API Development

### **Custom API Routes**

All custom APIs are in `src/app/api/custom/`:

#### **Authentication Pattern**
```typescript
// Example: GET /api/custom/customers/profile

import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(req: Request) {
  const payload = await getPayload({ config });
  
  // Extract JWT from cookies or Authorization header
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  // Verify customer authentication
  const { user } = await payload.auth({ headers: req.headers });
  
  if (!user || user.collection !== 'customers') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Proceed with authenticated logic...
}
```

#### **Example: Payment Creation**
```typescript
// POST /api/custom/customers/payments/route.ts

export async function POST(req: Request) {
  const payload = await getPayload({ config });
  const body = await req.json();
  
  // 1. Authenticate customer
  const { user } = await payload.auth({ headers: req.headers });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  // 2. Validate required fields
  const { amount, paymentType, bookingId, paymentForMonthAndYear } = body;
  
  if (!paymentType || !['rent', 'electricity'].includes(paymentType)) {
    return Response.json(
      { error: 'Invalid or missing paymentType' }, 
      { status: 400 }
    );
  }
  
  // 3. Format payment date to full ISO string
  const paymentDate = new Date(paymentForMonthAndYear).toISOString();
  
  // 4. Create payment record
  const payment = await payload.create({
    collection: 'payments',
    data: {
      customer: user.id,
      payfor: bookingId,
      paymentType,
      amount,
      status: 'pending',
      paymentForMonthAndYear: paymentDate,
      // Other fields auto-populated by hooks
    }
  });
  
  return Response.json({ success: true, payment });
}
```

For complete API documentation, see [API.md](./API.md).

---

## 🔄 Recent Refactoring

### **Rent Reminder Job - Critical Bug Fixes (January 2025)**

#### **Issue #1: Duplicate Invoice Prevention**
**Problem**: Job created duplicate rent invoices when:
- Job missed running on 1st of month
- Job ran multiple times due to retry logic
- Manual trigger executed alongside cron

**Solution**: Created guard function `hasExistingRentInvoiceForCurrentMonth()`
```typescript
// Location: src/payload/jobs/index.ts (line 94-143)

async function hasExistingRentInvoiceForCurrentMonth(
  payload: Payload,
  customerId: string,
  bookingId: string,
  currentMonth: string,
  currentYear: number
): Promise<boolean> {
  const existingPayments = await payload.find({
    collection: 'payments',
    where: {
      and: [
        { customer: { equals: customerId } },
        { payfor: { equals: bookingId } },
        { paymentType: { equals: 'rent' } },
        { paymentForMonthAndYear: { contains: `${currentYear}-${currentMonth}` } }
      ]
    },
    limit: 1
  });
  
  return existingPayments.docs.length > 0;
}
```

**Usage**: Check before creating payment
```typescript
const hasPaidForMonth = await hasExistingRentInvoiceForCurrentMonth(
  payload, customerId, bookingId, currentMonth, currentYear
);

if (hasPaidForMonth) {
  console.log('✅ Payment already exists, skipping creation');
  return;
}
```

#### **Issue #2: Food Cost Charged Twice**
**Problem**: `createPaymentRecord()` was calculating:
```typescript
// WRONG - charges food twice
const foodCharge = booking.foodPrice + property.foodMenu.price;
```

**Solution**: Use booking's food price (already includes property price)
```typescript
// CORRECT - use booking.foodPrice only (line 250-320)
const foodCharge = booking.foodPrice || 0;

// Booking.foodPrice is auto-populated from property on booking creation
```

#### **Issue #3: Payment Query Not Filtered by Booking**
**Problem**: `fetchCustomerPayments()` queried all payments for customer:
```typescript
// WRONG - returns payments from all bookings
where: {
  customer: { equals: customerId }
}
```

**Solution**: Filter by both booking ID and payment type
```typescript
// CORRECT (line 193-220)
where: {
  and: [
    { customer: { equals: customerId } },
    { payfor: { equals: bookingId } },      // Filter by specific booking
    { paymentType: { equals: 'rent' } }      // Filter by payment type
  ]
}
```

#### **Issue #4: Inactive Bookings Receiving Reminders**
**Problem**: Job processed cancelled and completed bookings

**Solution**: Added booking status and date validation
```typescript
// Location: src/payload/jobs/index.ts (line 430-515)

async function processCustomerBooking(booking) {
  // 1. Skip cancelled or completed bookings
  if (['cancelled', 'completed'].includes(booking.status)) {
    console.log(`⏭️ Skipping ${booking.status} booking`);
    return;
  }
  
  // 2. Validate booking is active (after check-in, before check-out)
  const now = new Date();
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  
  if (now < checkIn || now > checkOut) {
    console.log(`⏭️ Booking not in active period`);
    return;
  }
  
  // 3. Only process confirmed or active bookings
  if (!['confirmed', 'active'].includes(booking.status)) {
    console.log(`⏭️ Booking status ${booking.status} not eligible`);
    return;
  }
  
  // Proceed with payment creation and notification...
}
```

### **API Breaking Changes Fixed**

#### **Missing `paymentType` Field**
**Affected Routes**:
- `POST /api/custom/customers/payments` (line 26-50)
- `POST /api/custom/customers/payments/initiate` (line 91)

**Fix**: Added paymentType validation and auto-population
```typescript
// POST /api/custom/customers/payments
const { paymentType, ...otherFields } = body;

if (!paymentType || !VALID_PAYMENT_TYPES.includes(paymentType)) {
  return Response.json(
    { error: 'paymentType is required and must be: rent, electricity, security-deposit, late-fee, or other' },
    { status: 400 }
  );
}

// POST /api/custom/customers/payments/initiate
const payment = await payload.create({
  collection: 'payments',
  data: {
    paymentType: 'rent',  // Auto-set to 'rent' for initiate route
    // ... other fields
  }
});
```

#### **Booking Snapshot Properties**
**Problem**: Initiate route used wrong property names:
```typescript
// WRONG
bookingSnapshot: {
  price: booking.price,  // ❌ booking.price doesn't exist
  food: booking.food     // ❌ booking.food doesn't exist
}
```

**Fix**: Use correct booking properties (line 98-107)
```typescript
// CORRECT
bookingSnapshot: {
  roomRent: booking.roomRent,      // ✅ Correct
  foodPrice: booking.foodPrice,    // ✅ Correct
  total: booking.total,            // ✅ Correct
  property: booking.property.name,
  room: booking.room.roomNumber
}
```

### **UI Component Updates**

#### **RentSummary.tsx**
**Changes**: Added paymentType to payment creation (line 146-151, 170)
```typescript
const payment = await createPayment({
  customer: session.user.id,
  payfor: booking.id,
  bookingId: booking.id,
  paymentType: 'rent',              // ✅ Added
  amount: totalAmount,
  status: 'pending',
  paymentForMonthAndYear: new Date(`${year}-${month}-01`).toISOString()  // ✅ Fixed format
});
```

---

## 📝 Development Guidelines

### **Code Style**
- **TypeScript**: Use strict mode, avoid `any`
- **Formatting**: Prettier with 2-space indentation
- **Linting**: ESLint with Next.js config
- **Naming**: camelCase for variables/functions, PascalCase for components

### **Collection Development**
1. Define schema in `src/payload/collections/`
2. Add hooks for auto-population and validation
3. Generate TypeScript types: `npm run generate:types`
4. Create custom admin UI components if needed
5. Document fields with clear descriptions

### **API Development**
1. Create route in `src/app/api/custom/`
2. Implement authentication check
3. Validate request body
4. Use Payload SDK for database operations
5. Return consistent error responses
6. Document in [API.md](./API.md)

### **Testing**
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:int

# E2E tests (requires dev server)
npm run dev        # Terminal 1
npm run test:e2e   # Terminal 2

# Type checking
npm run type-check

# Linting
npm run lint
```

### **Database Seeding**
```bash
# Via API
curl -X POST http://localhost:3000/api/seed

# Via admin panel
# Navigate to /admin → "Seed Test Data" button
```

### **Common Patterns**

#### **Fetching Related Data**
```typescript
const booking = await payload.findByID({
  collection: 'bookings',
  id: bookingId,
  depth: 2  // Populates nested relationships
});

// Access nested data
console.log(booking.property.name);
console.log(booking.room.roomNumber);
```

#### **Creating Records with Relationships**
```typescript
const payment = await payload.create({
  collection: 'payments',
  data: {
    customer: customerId,        // Relationship ID
    payfor: bookingId,           // Relationship ID
    amount: 10000,
    // Hooks will auto-populate bookingSnapshot
  }
});
```

#### **Conditional Field Visibility**
```typescript
// In collection config
{
  name: 'electricityCharges',
  type: 'number',
  admin: {
    condition: (data) => data?.paymentType === 'electricity'
  }
}
```

---

## 🔗 Related Documentation

- **[API.md](./API.md)** - Complete API reference
- **[SETUP.md](./SETUP.md)** - Installation and configuration
- **[RENT_REMINDERS.md](./RENT_REMINDERS.md)** - Rent reminder system details
- **[SECURITY.md](./SECURITY.md)** - Security guidelines

---

**Questions?** Check the [README.md](../README.md) or create an issue in the repository.
