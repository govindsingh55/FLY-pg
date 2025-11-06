# Payment Splitting Implementation - Rent & Electricity Bills

## Overview
Payments are now split into separate types: **Rent Payments** and **Electricity Bills**. This allows for more accurate billing where electricity is charged based on actual consumption rather than estimation.

---

## Key Changes

### 1. **New Payment Types**
Added `paymentType` field to the Payments collection with the following options:
- **rent** - Monthly rent payment (includes rent + food + other charges, **excludes electricity**)
- **electricity** - Separate electricity bill based on actual meter readings
- **security-deposit** - Security deposit payments
- **late-fee** - Late fee charges
- **other** - Miscellaneous payments

### 2. **Payments Collection Schema Updates**

#### Fields Added:
- `paymentType` - Required field to distinguish payment types
- `billingPeriodStart` - Start date for electricity billing period
- `billingPeriodEnd` - End date for electricity billing period
- `meterReadingStart` - Starting meter reading for electricity
- `meterReadingEnd` - Ending meter reading for electricity

#### Conditional Field Visibility:
- **For Rent Payments:**
  - Shows: `rent`, `lateFees`, `utilityCharges`
  - Hides: Electricity-specific fields
  - Auto-adds note: "⚡ Electricity charges are billed separately"

- **For Electricity Bills:**
  - Shows: `electricityUnitsConsumed`, `electricityRatePerUnit`, `electricityCharges`, meter readings, billing period
  - Hides: Rent-specific fields
  - Amount = Electricity charges only

### 3. **Automated Rent Payment Creation (Cron Job)**

The cron job (`CustomerRentReminderNotificationTask`) now:
1. Creates **rent payments only** (excludes electricity)
2. Sets `paymentType: 'rent'`
3. Calculates amount as: `rent + food charges` (no electricity)
4. Automatically adds a note indicating electricity is billed separately (if property has electricity billing enabled)

**Example Payment Created by Cron:**
```json
{
  "paymentType": "rent",
  "rent": 10000,
  "amount": 10500,  // 10000 rent + 500 food
  "status": "notified",
  "notes": "⚡ Note: Electricity charges are billed separately based on actual consumption."
}
```

### 4. **Manual Electricity Bill Creation**

Staff/managers can create separate electricity bill payments manually:

**Steps to Create Electricity Bill:**
1. Navigate to `/admin/collections/payments`
2. Click "Create New"
3. Select **Payment Type**: "Electricity Bill"
4. Fill in:
   - Customer
   - Booking
   - Electricity units consumed
   - Billing period dates
   - Meter readings (optional)
5. `electricityRatePerUnit` auto-populates from property settings
6. `electricityCharges` and `amount` auto-calculate

**Example Electricity Bill:**
```json
{
  "paymentType": "electricity",
  "electricityUnitsConsumed": 150,
  "electricityRatePerUnit": 8,  // Auto-populated from property
  "electricityCharges": 1200,   // Auto-calculated: 150 * 8
  "amount": 1200,
  "billingPeriodStart": "2025-11-01",
  "billingPeriodEnd": "2025-11-30",
  "status": "pending"
}
```

---

## Workflow

### Monthly Rent Billing (Automated)
1. **1st of each month:** Cron job runs
2. Creates rent payment for each active customer
3. Payment includes: Rent + Food (if applicable)
4. Payment **excludes** electricity
5. Customer receives notification about rent due
6. Note added: "Electricity charges are billed separately"

### Electricity Billing (Manual)
1. **When electricity bill arrives** (anytime during/after the month)
2. Staff checks actual meter reading or bill
3. Staff creates new payment with type "Electricity Bill"
4. Enters units consumed or reads from meter
5. System auto-calculates charges based on property's per-unit rate
6. Customer receives separate notification for electricity bill

---

## Benefits

### 1. **Accurate Billing**
- No need to estimate electricity consumption
- Charges based on actual usage
- No over/under-charging

### 2. **Clear Separation**
- Rent and electricity are separate line items
- Easy to track and reconcile
- Better financial reporting

### 3. **Flexible Timing**
- Rent payment created automatically on schedule
- Electricity bill created when actual data is available
- No delays in rent collection waiting for electricity data

### 4. **Transparency**
- Customers see clear breakdown
- Separate notifications for each payment type
- Better understanding of charges

---

## Admin UI Features

### Payment List View
Now shows `paymentType` column to easily filter:
- All rent payments
- All electricity bills
- Other payment types

### Payment Create/Edit Form
**Dynamic fields based on payment type:**
- Select payment type first
- Only relevant fields shown
- Auto-calculations work correctly for each type

### Filtering & Reporting
Can filter payments by:
- Payment type (rent, electricity, etc.)
- Status
- Date range
- Customer
- Property/Booking

---

## Database Query Examples

### Get All Rent Payments for a Customer
```javascript
const rentPayments = await payload.find({
  collection: 'payments',
  where: {
    customer: { equals: customerId },
    paymentType: { equals: 'rent' }
  }
})
```

### Get All Electricity Bills for a Booking
```javascript
const electricityBills = await payload.find({
  collection: 'payments',
  where: {
    payfor: { equals: bookingId },
    paymentType: { equals: 'electricity' }
  }
})
```

### Get Pending Electricity Bills (Staff View)
```javascript
const pendingElectricityBills = await payload.find({
  collection: 'payments',
  where: {
    paymentType: { equals: 'electricity' },
    status: { in: ['pending', 'notified'] }
  }
})
```

---

## Migration Notes

### Existing Payments
Old payments without `paymentType` will need to be updated:
- Set `paymentType: 'rent'` for existing payments
- Or run a migration script to populate this field

### Property Configuration
Ensure all properties have `electricityConfig` set up:
- `enabled: true` if electricity is billed separately
- `perUnitCost` set to the rate (e.g., 8 INR/kWh)

---

## Future Enhancements

1. **Bulk Electricity Bill Creation:**
   - Upload CSV with meter readings
   - Auto-create electricity bills for multiple customers

2. **Electricity Bill Reminders:**
   - Notification when meter reading is due
   - Reminder to staff to create bills

3. **Electricity Usage Analytics:**
   - Track consumption trends per customer
   - Alert on unusual consumption patterns

4. **Automated Meter Reading Integration:**
   - Connect to smart meters
   - Auto-create electricity bills from meter data

---

## Testing Checklist

- [ ] Create rent payment via cron job
- [ ] Verify electricity note is added to rent payment
- [ ] Create manual electricity bill payment
- [ ] Verify electricity charges auto-calculate correctly
- [ ] Check payment list shows correct payment types
- [ ] Filter payments by type
- [ ] Verify notifications sent for both payment types
- [ ] Test payment completion for both types
- [ ] Verify amounts calculate correctly for each type

---

## Support

For questions or issues:
- Check property `electricityConfig` settings
- Verify booking has correct property relationship
- Check Payload logs for auto-calculation errors
- Review payment hooks in `src/payload/collections/Payments.ts`

