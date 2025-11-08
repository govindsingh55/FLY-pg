# API Reference

> **Last Updated**: January 2025  
> **Base URL**: `http://localhost:3000` (development)

---

## 📚 Table of Contents

- [Authentication](#authentication)
- [Customer APIs](#customer-apis)
- [Payment APIs](#payment-apis)
- [Booking APIs](#booking-apis)
- [Dashboard APIs](#dashboard-apis)
- [Job Trigger APIs](#job-trigger-apis)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)

---

## 🔐 Authentication

### **Customer Authentication**

All customer APIs require authentication via JWT token stored in httpOnly cookies.

#### **Login**
```http
POST /api/customers/login
Content-Type: application/json

{
  "email": "customer1@example.com",
  "password": "password1"
}
```

**Response**:
```json
{
  "user": {
    "id": "65abc123...",
    "email": "customer1@example.com",
    "name": "John Doe",
    "collection": "customers"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "exp": 1705123456
}
```

#### **Logout**
```http
POST /api/customers/logout
Cookie: payload-token=...
```

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

#### **Get Current User**
```http
GET /api/customers/me
Cookie: payload-token=...
```

**Response**:
```json
{
  "user": {
    "id": "65abc123...",
    "email": "customer1@example.com",
    "name": "John Doe",
    "phone": "+919876543210",
    "status": "active"
  }
}
```

### **Admin Authentication**

Admin APIs use Payload's built-in authentication.

#### **Admin Login**
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

---

## 👤 Customer APIs

### **Get Customer Profile**

```http
GET /api/custom/customers/profile
Cookie: payload-token=...
```

**Response**:
```json
{
  "success": true,
  "customer": {
    "id": "65abc123...",
    "name": "John Doe",
    "email": "customer1@example.com",
    "phone": "+919876543210",
    "status": "active",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+919876543211",
      "relation": "Sister"
    },
    "notificationPreferences": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}
```

### **Update Customer Profile**

```http
PUT /api/custom/customers/profile
Cookie: payload-token=...
Content-Type: application/json

{
  "name": "John Updated Doe",
  "phone": "+919876543210",
  "address": {
    "street": "456 New St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400002"
  }
}
```

**Response**:
```json
{
  "success": true,
  "customer": { /* updated customer object */ }
}
```

### **Export Customer Data**

```http
GET /api/custom/customers/profile/export?format=json
Cookie: payload-token=...
```

**Query Parameters**:
- `format` (optional): `json` or `csv` (default: `json`)

**Response** (JSON):
```json
{
  "success": true,
  "data": {
    "customer": { /* customer data */ },
    "bookings": [ /* all bookings */ ],
    "payments": [ /* all payments */ ],
    "supportTickets": [ /* all tickets */ ]
  },
  "exportedAt": "2025-01-15T10:30:00.000Z"
}
```

**Response** (CSV): Downloads CSV file

### **Change Email**

```http
POST /api/custom/customers/account/change-email
Cookie: payload-token=...
Content-Type: application/json

{
  "newEmail": "newemail@example.com",
  "password": "currentPassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email changed successfully. Please log in with your new email."
}
```

### **Change Password**

```http
POST /api/custom/customers/account/change-password
Cookie: payload-token=...
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### **Change Phone**

```http
POST /api/custom/customers/account/change-phone
Cookie: payload-token=...
Content-Type: application/json

{
  "newPhone": "+919876543299",
  "password": "currentPassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Phone number changed successfully"
}
```

### **Deactivate Account**

```http
POST /api/custom/customers/account/deactivate
Cookie: payload-token=...
Content-Type: application/json

{
  "password": "currentPassword123",
  "reason": "Taking a break"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Account deactivated successfully"
}
```

### **Delete Account (Soft Delete)**

```http
POST /api/custom/customers/account/delete
Cookie: payload-token=...
Content-Type: application/json

{
  "password": "currentPassword123",
  "confirmation": "DELETE"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 💳 Payment APIs

### **Get Customer Payments**

```http
GET /api/custom/customers/payments
Cookie: payload-token=...
```

**Query Parameters**:
- `bookingId` (optional): Filter by booking
- `paymentType` (optional): Filter by type (`rent`, `electricity`, etc.)
- `status` (optional): Filter by status
- `limit` (optional): Number of results (default: 10)
- `page` (optional): Page number (default: 1)

**Response**:
```json
{
  "success": true,
  "payments": {
    "docs": [
      {
        "id": "65xyz789...",
        "customer": "65abc123...",
        "payfor": "65def456...",
        "paymentType": "rent",
        "amount": 10500,
        "rent": 10000,
        "lateFees": 0,
        "utilityCharges": 500,
        "status": "completed",
        "paymentMethod": "UPI",
        "paymentSource": "phonepe",
        "paymentForMonthAndYear": "2025-01-01T00:00:00.000Z",
        "paymentDate": "2025-01-05T14:30:00.000Z",
        "dueDate": "2025-01-07T00:00:00.000Z",
        "bookingSnapshot": {
          "roomRent": 10000,
          "foodPrice": 5000,
          "total": 15000,
          "property": "Green Valley PG",
          "room": "101"
        },
        "gateway": {
          "merchantTransactionId": "TXN123456",
          "transactionId": "PHONEPE789012"
        },
        "createdAt": "2025-01-01T09:00:00.000Z",
        "updatedAt": "2025-01-05T14:30:00.000Z"
      }
    ],
    "totalDocs": 12,
    "limit": 10,
    "page": 1,
    "totalPages": 2
  }
}
```

### **Create Payment**

```http
POST /api/custom/customers/payments
Cookie: payload-token=...
Content-Type: application/json

{
  "bookingId": "65def456...",
  "paymentType": "rent",
  "amount": 10000,
  "paymentForMonthAndYear": "2025-01-01T00:00:00.000Z"
}
```

**Required Fields**:
- `bookingId` (string): Booking ID
- `paymentType` (string): One of: `rent`, `electricity`, `security-deposit`, `late-fee`, `other`
- `amount` (number): Payment amount in INR
- `paymentForMonthAndYear` (string): Full ISO date string (e.g., `2025-01-01T00:00:00.000Z`)

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": "65xyz789...",
    "customer": "65abc123...",
    "payfor": "65def456...",
    "paymentType": "rent",
    "amount": 10000,
    "status": "pending",
    // ... other fields
  }
}
```

### **Initiate PhonePe Payment**

```http
POST /api/custom/customers/payments/initiate
Cookie: payload-token=...
Content-Type: application/json

{
  "bookingId": "65def456...",
  "amount": 10000,
  "paymentForMonthAndYear": "2025-01-01T00:00:00.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "redirectUrl": "https://api-uat.phonepe.com/pg-sandbox/pg/v1/pay/...",
  "merchantTransactionId": "TXN_65abc123_1705123456789",
  "paymentId": "65xyz789..."
}
```

**Flow**:
1. Frontend calls this endpoint
2. Backend creates payment record with `status: 'pending'`
3. Backend initiates PhonePe payment request
4. Returns `redirectUrl` to frontend
5. Frontend redirects customer to PhonePe gateway
6. PhonePe processes payment
7. PhonePe calls webhook: `POST /api/custom/payments/phonepe/callback`
8. Backend updates payment status
9. PhonePe redirects customer back to success/failure page

### **PhonePe Callback (Webhook)**

```http
POST /api/custom/payments/phonepe/callback
Content-Type: application/json
X-Verify: <PhonePe signature>

{
  "response": "<base64 encoded payment response>",
  "merchantId": "PGTESTPAYUAT",
  "merchantTransactionId": "TXN_65abc123_1705123456789"
}
```

**Note**: This endpoint is called by PhonePe's servers, not the frontend.

**Processing**:
1. Verifies PhonePe signature
2. Decodes payment response
3. Updates payment status based on PhonePe status:
   - `PAYMENT_SUCCESS` → `completed`
   - `PAYMENT_FAILED` → `failed`
   - `PAYMENT_PENDING` → `processing`
4. Updates gateway transaction details
5. Sends customer notification email

---

## 📅 Booking APIs

### **Get Customer Bookings**

```http
GET /api/custom/customers/bookings
Cookie: payload-token=...
```

**Query Parameters**:
- `status` (optional): Filter by status
- `limit` (optional): Number of results (default: 10)
- `page` (optional): Page number (default: 1)

**Response**:
```json
{
  "success": true,
  "bookings": {
    "docs": [
      {
        "id": "65def456...",
        "customer": "65abc123...",
        "property": {
          "id": "65ghi789...",
          "name": "Green Valley PG",
          "address": "123 MG Road, Mumbai"
        },
        "room": {
          "id": "65jkl012...",
          "roomNumber": "101",
          "roomType": "single"
        },
        "checkInDate": "2024-12-01T00:00:00.000Z",
        "checkOutDate": "2025-06-01T00:00:00.000Z",
        "roomRent": 10000,
        "foodPrice": 5000,
        "securityDeposit": 20000,
        "bookingCharge": 1000,
        "total": 36000,
        "status": "active",
        "takeFirstMonthRentOnBooking": false,
        "createdAt": "2024-11-25T10:00:00.000Z"
      }
    ],
    "totalDocs": 3,
    "limit": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

### **Create Booking**

```http
POST /api/custom/booking
Cookie: payload-token=...
Content-Type: application/json

{
  "propertyId": "65ghi789...",
  "roomId": "65jkl012...",
  "checkInDate": "2025-02-01",
  "checkOutDate": "2025-08-01"
}
```

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "65def456...",
    "customer": "65abc123...",
    "property": "65ghi789...",
    "room": "65jkl012...",
    "checkInDate": "2025-02-01T00:00:00.000Z",
    "checkOutDate": "2025-08-01T00:00:00.000Z",
    "roomRent": 10000,          // Auto-populated from room
    "foodPrice": 5000,          // Auto-populated from property
    "securityDeposit": 20000,   // Auto-calculated
    "bookingCharge": 1000,      // Auto-populated from property
    "total": 36000,             // Auto-calculated
    "status": "pending",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Note**: All pricing fields are auto-populated by the `beforeValidate` hook. See [DEVELOPMENT.md](./DEVELOPMENT.md#hooks--validation) for details.

### **Cancel Booking**

```http
POST /api/custom/customers/bookings/{bookingId}/cancel
Cookie: payload-token=...
Content-Type: application/json

{
  "reason": "Personal reasons"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "booking": { /* updated booking with status: 'cancelled' */ }
}
```

---

## 📊 Dashboard APIs

### **Get Dashboard Stats**

```http
GET /api/custom/customers/dashboard/stats
Cookie: payload-token=...
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "activeBookings": 2,
    "totalPaid": 125000,
    "pendingPayments": 10000,
    "overduePayments": 2000,
    "openTickets": 1,
    "upcomingPayments": 1
  }
}
```

### **Get Activity Feed**

```http
GET /api/custom/customers/dashboard/activity
Cookie: payload-token=...
```

**Query Parameters**:
- `limit` (optional): Number of activities (default: 10)
- `offset` (optional): Skip activities (default: 0)

**Response**:
```json
{
  "success": true,
  "activities": [
    {
      "id": "activity_123",
      "type": "payment_completed",
      "title": "Payment Completed",
      "description": "Rent payment for January 2025 completed",
      "timestamp": "2025-01-05T14:30:00.000Z",
      "metadata": {
        "paymentId": "65xyz789...",
        "amount": 10000
      }
    },
    {
      "id": "activity_124",
      "type": "booking_created",
      "title": "New Booking",
      "description": "Booked Room 101 at Green Valley PG",
      "timestamp": "2024-11-25T10:00:00.000Z",
      "metadata": {
        "bookingId": "65def456...",
        "property": "Green Valley PG"
      }
    }
  ],
  "hasMore": true,
  "nextOffset": 10
}
```

### **Get Upcoming Payments**

```http
GET /api/custom/customers/dashboard/upcoming-payments
Cookie: payload-token=...
```

**Response**:
```json
{
  "success": true,
  "upcomingPayments": [
    {
      "id": "65xyz789...",
      "paymentType": "rent",
      "amount": 10000,
      "dueDate": "2025-02-07T00:00:00.000Z",
      "status": "pending",
      "booking": {
        "property": "Green Valley PG",
        "room": "101"
      }
    }
  ]
}
```

### **Get Rent Summary**

```http
GET /api/custom/customers/rent/summary
Cookie: payload-token=...
```

**Response**:
```json
{
  "success": true,
  "financialSummary": {
    "totalPaid": 125000,
    "totalPending": 10000,
    "totalOverdue": 2000,
    "averageMonthlyRent": 10000,
    "rentPaid": 100000,
    "rentPending": 8000,
    "electricityPaid": 25000,
    "electricityPending": 2000
  },
  "recentPayments": [
    /* last 5 payments */
  ]
}
```

---

## 🔧 Job Trigger APIs

### **Trigger Rent Reminder Job**

```http
POST /api/custom/jobs/trigger-rent-reminder
Authorization: Bearer {JOB_TRIGGER_API_TOKEN}
Content-Type: application/json

{
  "dryRun": false
}
```

**Headers**:
- `Authorization`: Bearer token from `JOB_TRIGGER_API_TOKEN` environment variable

**Body**:
- `dryRun` (optional, boolean): If `true`, simulates job execution without creating payments or sending emails

**Response**:
```json
{
  "success": true,
  "message": "Customer rent reminder notification scheduled successfully",
  "jobId": "job_65abc123_1705123456789"
}
```

**Job Behavior**:
1. Fetches all active customers with confirmed/active bookings
2. For each booking:
   - Checks if rent payment exists for current month
   - If no payment: Creates payment record + sends gentle reminder email
   - If payment overdue (after 7th): Sends late payment warning email
3. Processes customers in parallel for efficiency

**See Also**: [RENT_REMINDERS.md](./RENT_REMINDERS.md) for complete documentation

---

## 🔄 Common Patterns

### **Pagination**

Most list endpoints support pagination:

```http
GET /api/custom/customers/payments?page=2&limit=20
```

**Response includes**:
```json
{
  "docs": [ /* results */ ],
  "totalDocs": 45,
  "limit": 20,
  "page": 2,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPrevPage": true
}
```

### **Filtering**

Use query parameters for filtering:

```http
GET /api/custom/customers/payments?paymentType=rent&status=completed
```

### **Sorting**

```http
GET /api/custom/customers/payments?sort=-createdAt
```

- Use `-` prefix for descending order
- No prefix for ascending order

### **Depth (Population)**

Control relationship population depth:

```http
GET /api/custom/customers/bookings?depth=2
```

- `depth=0`: No population (IDs only)
- `depth=1`: Populate first level
- `depth=2`: Populate nested relationships

---

## ❌ Error Handling

### **Error Response Format**

```json
{
  "success": false,
  "error": "Error message",
  "details": { /* optional additional info */ }
}
```

### **HTTP Status Codes**

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request body, missing required fields |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource (e.g., email already exists) |
| `500` | Internal Server Error | Server-side error |

### **Common Errors**

#### **Authentication Errors**

```json
{
  "success": false,
  "error": "Unauthorized. Please log in."
}
```

**Solution**: Ensure JWT token is included in cookies or `Authorization` header

#### **Validation Errors**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "paymentType": "paymentType is required and must be one of: rent, electricity, security-deposit, late-fee, other"
  }
}
```

**Solution**: Check required fields and valid values

#### **Not Found Errors**

```json
{
  "success": false,
  "error": "Booking not found"
}
```

**Solution**: Verify the resource ID exists and belongs to the authenticated user

---

## 📝 Notes

### **Date Formats**
- All dates are in ISO 8601 format: `2025-01-15T10:30:00.000Z`
- `paymentForMonthAndYear` must be a full ISO date (e.g., `2025-01-01T00:00:00.000Z`)

### **Currency**
- All amounts are in INR (Indian Rupees)
- No decimal places (integer only)

### **Payment Types**
- `rent`: Monthly rent payments (includes rent + food + utilities, **excludes electricity**)
- `electricity`: Separate electricity bills based on actual consumption
- `security-deposit`: Refundable security deposit
- `late-fee`: Late payment penalties
- `other`: Miscellaneous charges

### **Payment Status**
- `pending`: Payment created, awaiting customer action
- `notified`: Reminder sent to customer
- `processing`: Payment in progress (PhonePe processing)
- `completed`: Payment successful
- `failed`: Payment failed
- `cancelled`: Payment cancelled
- `refunded`: Payment refunded

### **Booking Status**
- `pending`: Booking created, awaiting admin approval
- `confirmed`: Booking approved by admin
- `active`: Customer checked in
- `cancelled`: Booking cancelled
- `completed`: Customer checked out

---

## 🔗 Related Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide with hooks and validation
- **[SETUP.md](./SETUP.md)** - Installation and configuration
- **[RENT_REMINDERS.md](./RENT_REMINDERS.md)** - Rent reminder system
- **[README.md](../README.md)** - Project overview

---

**Have questions?** Check the [DEVELOPMENT.md](./DEVELOPMENT.md) guide or open an issue.
