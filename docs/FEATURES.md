# Features Documentation

This document provides a comprehensive overview of all features available in the Property Management System, organized by user portal and role.

## Portal Overview

The system has three main portals:

1. **Admin Portal** (`/admin/*`) - For administrators, managers, and property managers
2. **Customer Portal** (`/dashboard/*`) - For tenants and customers
3. **Staff Portal** (`/staff/*`) - For staff members (chef, janitor, security)

---

## Admin Portal Features

### Dashboard (`/admin`)

**Access**: Admin, Manager, Property Manager

**Features**:

- Overview statistics and key metrics
- Quick access to all admin features
- Recent activity feed

**Reference**: [Route: /admin](file:///c:/dev/FLY-pg-v2/src/routes/admin/+page.svelte)

---

### Properties Management (`/admin/properties`)

**Access**: Admin, Manager, Property Manager (limited to assigned properties)

**Features**:

- **List Properties**: View all properties with search and pagination
- **Create Property**: Add new property with full details
  - Basic info (name, address, contact)
  - Location (city, state, ZIP, coordinates)
  - Amenities selection
  - Food service options
  - Electricity unit cost
  - Booking charges
- **Edit Property**: Update existing property details
- **Delete Property**: Soft delete properties
- **View Property Details**: See property overview, rooms, and contracts
- **Manage Property Media**: Upload and manage property images/documents

**Route**: [src/routes/admin/properties](file:///c:/dev/FLY-pg-v2/src/routes/admin/properties)

---

### Rooms Management (`/admin/properties/[id]`)

**Access**: Admin, Manager, Property Manager

**Features**:

- **List Rooms**: View all rooms for a property
- **Create Room**: Add new room with:
  - Room number
  - Room type (single, double, triple, dorm)
  - Capacity
  - Monthly rent price
  - Deposit amount
  - Features (JSON array)
  - Status (available, occupied, maintenance)
- **Edit Room**: Update room details via sheet/drawer UI
- **Delete Room**: Soft delete rooms
- **Room Media**: Upload and manage room images

**Route**: [src/routes/admin/properties/[id]](file:///c:/dev/FLY-pg-v2/src/routes/admin/properties)

---

### Customers Management (`/admin/customers`)

**Access**: Admin, Manager

**Features**:

- **View Customers**: View-only list of all customers
- **Search & Filter**: Search by name, email, or phone
- **Pagination**: Navigate through customer records
- **Customer Details**: View full customer profile including:
  - Personal information
  - Contact details
  - ID proof details
  - Emergency contacts
  - Active bookings/contracts
  - Payment history

**Note**: Customer creation and editing is done through the booking/contract flow.

**Route**: [src/routes/admin/customers](file:///c:/dev/FLY-pg-v2/src/routes/admin/customers)

---

### Bookings Management (`/admin/bookings`)

**Access**: Admin, Manager, Property Manager

**Features**:

- **Create Booking**: Book a room for a customer
  - Select property and available room
  - Customer information (create new or select existing)
  - Booking charge
  - Payment status
- **Update Booking Status**: Pending → Confirmed → Completed
- **Cancel Booking**: Mark bookings as cancelled
- **Payment Tracking**: Track booking charge payment status
- **Convert to Contract**: Create rental contract from confirmed booking

**Remote Logic**: [bookings.remote.ts](file:///c:/dev/FLY-pg-v2/src/routes/admin/bookings/bookings.remote.ts)

---

### Contracts Management (`/admin/contracts`)

**Access**: Admin, Manager, Property Manager

**Features**:

- **Create Contract**: Generate rental contract from booking
  - Contract type (rent, lease, other)
  - Start and end dates
  - Rent amount
  - Security deposit
  - Food service inclusion
  - Contract document upload
  - Custom notes
- **View Active Contracts**: List all active rental agreements
- **Edit Contract**: Update contract details
- **Terminate Contract**: End contract early with reason
- **Contract Status**: Active, Expired, Terminated

**Route**: [src/routes/admin/contracts](file:///c:/dev/FLY-pg-v2/src/routes/admin/contracts)

---

### Payments Management (`/admin/payments`)

**Access**: Admin, Manager, Property Manager

**Features**:

- **Record Payment**: Manual payment entry by admin
  - Payment type (rent, security deposit, maintenance, electricity, other)
  - Amount
  - Payment mode (cash, online, UPI)
  - Transaction ID
  - Payment date
- ** Payment Verification**: Verify customer-submitted payments
  - **Status Filter**: Filter by All/Pending/Paid/Failed
  - **Transaction ID Display**: View transaction ID and payment method
  - **Verify Button**: Approve pending payments (status → paid)
  - **Reject Button**: Reject invalid payments (status → failed)
  - **Property Manager Scope**: Can only verify for assigned properties
- **Link to Booking/Contract**: Associate payments
- **Payment Status**: Pending, Paid, Failed, Refunded
- **Payment History**: View all payment records with pagination
- **Filter by Type**: Filter by payment category
- **Search**: Search by customer or transaction ID

**Route**: [src/routes/admin/payments](file:///c:/dev/FLY-pg-v2/src/routes/admin/payments)
**Remote Functions**: [payments.remote.ts](file:///c:/dev/FLY-pg-v2/src/routes/admin/payments/payments.remote.ts)

---

### Electricity Billing (`/admin/electricity`)

**Access**: Admin, Manager, Property Manager

**Features**:

- **Record Meter Reading**: Enter monthly electricity consumption
  - Select contract (with autocomplete)
  - Reading date
  - Month and year
  - Units consumed
  - Auto-calculate cost based on property unit cost
  - Optional notes
- **View Readings History**: See all electricity readings
- **Link to Payment**: Connect reading to payment record
- **Direct Access**: Quick "Record Reading" links from customer list
- **Duplicate Prevention**: Prevents duplicate readings for same contract/month/year

**Remote Logic**: [electricity.remote.ts](file:///c:/dev/FLY-pg-v2/src/routes/admin/electricity/electricity.remote.ts)

---

### Tickets Management (`/admin/tickets`)

**Access**: Admin, Manager, Property Manager, Staff

**Features**:

- **View Tickets**: See all maintenance tickets
- **Ticket Details**: View full ticket information
  - Subject and description
  - Type (electricity, plumbing, furniture, wifi, other)
  - Priority (low, medium, high)
  - Status (open, in_progress, resolved, closed)
  - Property/room reference
- **Assign Tickets**: Assign to staff members
- **Update Status**: Change ticket progress status
- **Ticket Chat**: Thread-based messaging
  - Add messages/updates
  - Customer-staff communication
- **Filter by Status**: View open, in-progress, or resolved tickets

**Route**: [src/routes/admin/tickets](file:///c:/dev/FLY-pg-v2/src/routes/admin/tickets)

---

### Staff Management (`/admin/staff`)

**Access**: Admin, Manager

**Features**:

- **Create Staff**: Add new staff members
  - User role (manager, property_manager, staff)
  - Staff type (chef, janitor, security) for staff role
  - Name, email, default password
- **Edit Staff**: Update staff details and role
- **Delete Staff**: Remove staff accounts
- **Property Assignments**: Assign staff to properties
- **Search & Filter**: Find staff by name or type
- **Pagination**: Navigate staff records

**Route**: [src/routes/admin/staff](file:///c:/dev/FLY-pg-v2/src/routes/admin/staff)

---

### Property Assignments (`/admin/assignments`)

**Access**: Admin, Manager

**Features**:

- **Assign Property Managers**: Link managers to specific properties
- **Assign Staff**: Link staff members to properties
- **View Assignments**: See current property assignments
- **Remove Assignments**: Unlink staff from properties

**Route**: [src/routes/admin/assignments](file:///c:/dev/FLY-pg-v2/src/routes/admin/assignments)

---

### Visit Bookings (`/admin/visits`)

**Access**: Admin, Manager, Property Manager

**Features**:

- **View Visit Requests**: See scheduled property visits
- **Accept/Reject Visits**: Manage visit approval
- **Visit Details**: Customer info, property, date/time
- **Status Tracking**: Pending, Accepted, Cancelled
- **Cancel with Reason**: Add cancellation notes

**Route**: [src/routes/admin/visits](file:///c:/dev/FLY-pg-v2/src/routes/admin/visits)

---

### Amenities Management (`/admin/amenities`)

**Access**: Admin, Manager

**Features**:

- **Create Amenity**: Define new amenity types
  - Name and description
  - Icon selection (Lucide icons)
  - Image upload
- **Edit Amenity**: Update amenity details
- **Delete Amenity**: Remove unused amenities
- **Assign to Properties**: Link amenities to properties

**Route**: [src/routes/admin/amenities](file:///c:/dev/FLY-pg-v2/src/routes/admin/amenities)

---

### Media Management (`/admin/media`)

**Access**: Admin, Manager

**Features**:

- **Upload Media**: Property and room images/documents
- **Media Types**: Image, Document, Video, Other
- **Organize by Property/Room**: Filter media by entity
- **Delete Media**: Remove uploaded files

**Route**: [src/routes/admin/media](file:///c:/dev/FLY-pg-v2/src/routes/admin/media)

---

### Notifications (`/admin/notifications`)

**Access**: Admin, Manager

**Features**:

- **Send Notifications**: Create system notifications
  - Select recipient (user, customer, all)
  - Notification type (info, warning, success, error, rent, electricity)
  - Title and message
- **View Notifications**: See sent notifications
- **Notification History**: Track notification delivery

**Route**: [src/routes/admin/notifications](file:///c:/dev/FLY-pg-v2/src/routes/admin/notifications)

---

### System Settings (`/admin/settings`)

**Access**: Admin only

**Features**:

- **Application Settings**: Configure system-wide settings
- **Key-Value Storage**: JSON-based configuration
- **Setting Management**: Update system parameters

**Route**: [src/routes/admin/settings](file:///c:/dev/FLY-pg-v2/src/routes/admin/settings)

---

## Customer Portal Features

### Customer Dashboard (`/dashboard`)

**Access**: Customer role

**Features**:

- **Dashboard Overview**: Personal account summary
- **Current Booking**: Active room booking details
- **Contract Info**: Active rental contract
- **Recent Payments**: Payment history
- **Notifications**: System messages and alerts

**Route**: [src/routes/dashboard](file:///c:/dev/FLY-pg-v2/src/routes/dashboard)

---

### Customer Tickets (`/dashboard/tickets`)

**Access**: Customer

**Features**:

- **Create Ticket**: Report maintenance issues
  - Subject and description
  - Issue type
  - Priority selection
- **View My Tickets**: See all personal tickets
- **Ticket Updates**: Receive staff responses
- **Chat Thread**: Communicate with staff
- **Track Status**: Monitor ticket resolution

**Route**: [src/routes/dashboard/tickets](file:///c:/dev/FLY-pg-v2/src/routes/dashboard)

---

### Customer Payments (`/dashboard/payments`)

**Access**: Customer

**Features**:

- **Submit Payment**: Customer-initiated payment submission
  - **Contract Selection**: Choose from active contracts
  - **Payment Type**: Rent, Electricity, Other
  - **Payment Mode**:
    - **Cash**: Auto-approved (status=paid immediately)
    - **UPI/Online**: Pending verification (requires transaction ID)
  - **Transaction ID**: Required for UPI/online payments
  - **Payment Method**: Optional (e.g., "Google Pay", "PhonePe")
  - **Auto-Status Logic**: Cash payments instantly marked as paid
  - **Validation**: Transaction ID required for online payments
- **View Payment History**: See all personal payments
- **Payment Details**: Type, amount, date, status, transaction ID
- **Pending Payments**: View payments awaiting verification
- **Payment Status Badges**: Visual status indicators (Pending/Paid/Failed)

**Route**: [src/routes/dashboard/payments](file:///c:/dev/FLY-pg-v2/src/routes/dashboard/payments)
**Remote Functions**: [payments.remote.ts](file:///c:/dev/FLY-pg-v2/src/routes/dashboard/payments/payments.remote.ts)

**Workflow**:

1. Customer submits payment with transaction ID
2. Payment marked as "Pending" if online/UPI
3. Admin verifies transaction ID
4. Admin approves (Paid) or rejects (Failed)
5. Customer sees updated status

---

### Customer Notifications (`/dashboard/notifications`)

**Access**: Customer

**Features**:

- **View Notifications**: Personal system messages
- **Mark as Read**: Notification read status
- **Notification Types**: Rent reminders, electricity bills, general info
- **Delete Notifications**: Clear old notifications

**Route**: [src/routes/dashboard/notifications](file:///c:/dev/FLY-pg-v2/src/routes/dashboard)

---

## Staff Portal Features

### Staff Dashboard (`/staff`)

**Access**: Staff role (chef, janitor, security)

**Features**:

- **Assigned Tickets**: View tickets assigned to staff member
- **Task Management**: Track assigned maintenance tasks
- **Update Ticket Status**: Mark progress on assigned tickets
- **Ticket Communication**: Reply to customer tickets

**Route**: [src/routes/staff](file:///c:/dev/FLY-pg-v2/src/routes/staff)

---

## Role-Based Access Control

### Admin Role

- **Full System Access**: All features and data
- **User Management**: Create/edit/delete all users
- **System Settings**: Configure application settings
- **All Properties**: Access to all properties and data

### Manager Role

- **Operational Access**: Similar to Admin
- **Property Management**: Manage all properties
- **Customer & Staff**: Full access to customers and staff
- **Restricted**: May not access system-wide settings

### Property Manager Role

- **Property-Scoped**: Access limited to assigned properties only
- **Property Operations**: Manage assigned properties, rooms, bookings
- **Customer Interactions**: Handle customers for assigned properties
- **Tickets & Payments**: View and manage for assigned properties

### Staff Role

- **Task-Based**: Access based on staff type
- **Chef**: Food service and menu management
- **Janitor**: Maintenance tickets
- **Security**: Visitor logs and security tickets
- **Assigned Tickets**: View and update assigned maintenance tasks

### Customer Role

- **Personal Data**: Access own bookings, contracts, payments
- **Ticket Creation**: Report maintenance issues
- **Notifications**: Receive and view system messages
- **Read-Only**: Cannot modify admin-managed data

---

## Technical Implementation

### Remote Functions Pattern

Features are implemented using a custom Remote Functions pattern:

- **`query`**: For data fetching (GET operations)
- **`form`**: For mutations (POST/PUT/DELETE operations)

Example: [bookings.remote.ts](file:///c:/dev/FLY-pg-v2/src/routes/admin/bookings/bookings.remote.ts)

### Validation Schemas

All features use **Zod** schemas for validation:

**Location**: [src/lib/schemas](file:///c:/dev/FLY-pg-v2/src/lib/schemas)

### UI Components

Features utilize **Shadcn-Svelte** components:

- **Forms**: Input, Select, Textarea, DatePicker
- **Dialogs**: Modal interactions
- **Sheets**: Side drawer for forms (room editing, etc.)
- **Tables**: Data display with sorting and filtering
- **Alerts**: Confirmation dialogs for destructive actions
- **Toast**: Success/error notifications

---

## Feature Status

### ✅ Completed Features

All features listed above are implemented and functional.

**Recent Additions**:

- ✅ Customer payment submission with transaction ID
- ✅ Admin payment verification workflow
- ✅ Property manager scoped payment verification
- ✅ Payment status filtering

### 🚧 Planned Enhancements

- Advanced reporting and analytics
- Email notifications integration
- **Payment gateway integration** (Stripe, Razorpay) - [See PAYMENT-GATEWAY.md](file:///c:/dev/FLY-pg-v2/docs/PAYMENT-GATEWAY.md)
- Mobile app support
- Multi-language support
- Bulk operations for admin tasks
