# Work Log & Verification Guide - Dec 8, 2025

This document outlines the features implemented today regarding Core Systems Hardening, specifically focusing on Payment Methods, Auto-Pay logic, and Booking Cancellation reconciliation. It includes instructions for manual verification.

## 1. Feature: Payment Methods Implementation

**Description**:
Added a new `PaymentMethods` collection to store tokenized payment details securely. Implemented API endpoints for customers to add, view, and delete their payment methods.

**Key Files**:

- `src/payload/collections/PaymentMethods.ts`: Schema definition.
- `src/app/api/custom/customers/payments/methods/route.ts`: API Endpoints (GET, POST, DELETE).

### Manual Verification Steps

| Feature           | Route / Action                                          | User Role | Steps                                                                                                                                                              | Expected Outcome                                                                                                                                              |
| :---------------- | :------------------------------------------------------ | :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Add Method**    | `POST /api/custom/customers/payments/methods`           | Customer  | 1. Login as a Customer.<br>2. Send POST request with body: `{ "type": "card", "name": "HDFC", "cardNumber": "1234567812345678", "expiry": "12/25", "cvv": "123" }` | 1. 200 OK response.<br>2. New document in `payment-methods` collection.<br>3. `maskedNumber` should be `************5678`.<br>4. `token` should be generated. |
| **List Methods**  | `GET /api/custom/customers/payments/methods`            | Customer  | 1. Login as the same Customer.<br>2. Send GET request to endpoint.                                                                                                 | 1. Returns list of payment methods.<br>2. `token` field is excluded/masked in response.                                                                       |
| **Delete Method** | `DELETE /api/custom/customers/payments/methods?id={id}` | Customer  | 1. Use ID from list above.<br>2. Send DELETE request.                                                                                                              | 1. 200 OK response.<br>2. Document removed from collection.                                                                                                   |

---

## 2. Feature: Auto-Pay Engine

**Description**:
Implemented a background job (`AutoPayProcessTask`) that runs daily to identify due rent payments and automatically processes them using the customer's default payment method.

**Key Files**:

- `src/payload/jobs/AutoPayTask.ts`: Cron logic and simulation.
- `src/payload/jobs/index.ts`: Job registration.

### Manual Verification Steps

| Feature         | Route / Action             | User Role | Steps                                                                                                                                                                                                                                                                        | Expected Outcome                                                                                                                                                       |
| :-------------- | :------------------------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Setup Data**  | N/A (Database/Admin)       | Admin     | 1. **Create Customer**: Ensure `autoPayEnabled` is true.<br>2. **Add Payment Method**: Create a method for this customer and set `isDefault: true`.<br>3. **Create Payment**: Create a `payment` record with `status: pending`, `paymentType: rent`, and `dueDate` <= today. | Data ready for testing.                                                                                                                                                |
| **Trigger Job** | Payload Admin UI / Console | Admin     | 1. Ideally wait for cron or manually invoke specific test script (since it's a background task).<br>_(Dev Check: Modify `AutoPayTask.ts` to run on server start temporarily or use a specific dev route to invoke handler)_                                                  | 1. Console logs: `🚀 [AutoPay] Starting...`.<br>2. Payment status updates to `completed`.<br>3. `gateway` set to `auto-pay-simulation`.<br>4. `paymentMethod` updated. |

---

## 3. Feature: Booking Cancellation Reconciliation

**Description**:
Enhanced the booking cancellation API to automatically find and "void" (mark as failed) any pending payments associated with that booking. This prevents "ghost" invoices for cancelled bookings.

**Key Files**:

- `src/app/api/custom/customers/bookings/[id]/cancel/route.ts`: Cancellation logic.

### Manual Verification Steps

| Feature            | Route / Action                                    | User Role | Steps                                                                                                                                                                                    | Expected Outcome                                                                                                                                                             |
| :----------------- | :------------------------------------------------ | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cancel Booking** | `POST /api/custom/customers/bookings/[id]/cancel` | Customer  | 1. **Setup**: Create a Booking. Create a `pending` Payment linked to this Booking (`payfor` field).<br>2. Login as Customer.<br>3. specific call to cancel endpoint for that booking ID. | 1. Booking status becomes `cancelled`.<br>2. **Crucially**: The associated `pending` Payment status changes to `failed`.<br>3. Payment notes updated with cancellation info. |

---

## 4. Feature: Staff Dashboard Data Population

**Description**:
Connected the read-only staff dashboard pages (Bookings, Customers, Properties) to real data from the Payload CMS Local API.

**Key Files**:

- `src/app/(staff)/staff/(portal)/bookings/page.tsx`
- `src/app/(staff)/staff/(portal)/customers/page.tsx`
- `src/app/(staff)/staff/(portal)/properties/page.tsx`

### Manual Verification Steps

| Feature             | Route / Action      | User Role | Steps                                                    | Expected Outcome                                                                                          |
| :------------------ | :------------------ | :-------- | :------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **View Bookings**   | `/staff/bookings`   | Staff     | 1. Login as Staff user.<br>2. Navigate to Bookings page. | 1. Table displays real bookings from DB.<br>2. Customer names and Property names are populated correctly. |
| **View Customers**  | `/staff/customers`  | Staff     | 1. Navigate to Customers page.                           | 1. Table displays list of active/inactive customers.                                                      |
| **View Properties** | `/staff/properties` | Staff     | 1. Navigate to Properties page.                          | 1. Table displays properties with manager details.                                                        |

---

## 5. Security & Lint Fixes

**Description**:

- Hardened access control for `PaymentMethods`.
- Resolved `Unexpected any` types in `AutoPayTask.ts` by using generated types.
- Fixed Tailwind CSS warnings (`z-indices`, `backdrop-filter`).

**Key Files**:

- `src/payload/jobs/AutoPayTask.ts`
- `src/components/marketing/BottomNav.tsx`

### Verification

- **Build Check**: Run `npm run build` to verify no TypeScript or Linting errors block the build.
- **Code Review**: Check `AutoPayTask.ts` imports to ensure no `as any` casts remain on critical logic.
