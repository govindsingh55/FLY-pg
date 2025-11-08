
# Rent Reminder Notification System
## 🐛 Critical Bug Fixes (2025 Refactor)

The rent reminder system was refactored to address 4 critical bugs:

### 1. Duplicate Invoice Prevention
- **Problem:** The job could create multiple rent invoices for the same month if run more than once or missed the 1st.
- **Fix:** Added a guard (`hasExistingRentInvoiceForCurrentMonth`) to check for an existing rent payment for the booking and month before creating a new one.

### 2. Food Cost Charged Twice
- **Problem:** Food charges were being added twice (from both booking and property).
- **Fix:** Now only `booking.foodPrice` is used (auto-populated from property at booking creation), never summed with property price again.

### 3. Payment Query Not Filtered by Booking
- **Problem:** Payment history queries were not filtered by booking, causing cross-booking contamination.
- **Fix:** Payment queries now filter by both `customer`, `bookingId`, and `paymentType` to ensure only relevant payments are considered.

### 4. Inactive Bookings Receiving Reminders
- **Problem:** Cancelled or completed bookings were still processed for reminders.
- **Fix:** The job now skips bookings with status `cancelled` or `completed`, and only processes those in the active date range and with eligible status.

**See [DEVELOPMENT.md](./DEVELOPMENT.md#recent-refactoring) for code details.**

A comprehensive automated rent reminder system that sends email notifications to customers based on their payment status and booking information.

## 📋 **Overview**

The rent reminder system automatically:
- Processes all active customers with bookings
- Checks payment status and history
- Creates payment records when needed
- Sends appropriate email notifications (gentle reminders or late payment warnings)
- Handles food service charges if applicable
- Logs all activities for monitoring and debugging

## 🏗️ **System Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   NPM Script    │───▶│   API Endpoint   │───▶│   Job Queue     │
│ (Manual/Cron)   │    │ /api/custom/jobs │    │ (Payload CMS)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Email Service   │◀───│ Business Logic   │◀───│   Task Handler  │
│   (Resend)      │    │ (Payment Check)  │    │ (Background)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- MongoDB database
- Resend email service account
- Active customers with bookings in the database

### **Environment Variables**
```env
# Required
JOB_TRIGGER_API_TOKEN=your_secure_token_here
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_ADDRESS=noreply@yourdomain.com
DATABASE_URI=mongodb://localhost:27017/your-database
PAYLOAD_SECRET=your_payload_secret

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_FROM_NAME=Your Company Name
```

### **Basic Usage**
```bash
# Execute rent reminders (production)
npm run rent-reminders

# Test without execution
npm run rent-reminders:dry-run

# Detailed logging
npm run rent-reminders:verbose

# Check system status
npm run rent-reminders:status

# Show help
npm run rent-reminders:help
```

## 📧 **Email Templates**

### **Gentle Reminder**
- **Trigger**: New payment due (beginning of month)
- **Subject**: "Payment Reminder - Gentle Notice"
- **Content**: Polite reminder for current month's rent

### **Late Payment Warning**
- **Trigger**: Payment overdue (after 7th of month)
- **Subject**: "Payment Reminder - Late Payment Warning"
- **Content**: Warning about potential late fees

## ⚙️ **Configuration**

### **Payment Constants**
```javascript
const PAYMENT_CONSTANTS = {
  DUE_DATE_DAY: 7,           // Late payment threshold
  FIRST_DAY_OF_MONTH: 1,     // Payment due date
  MAX_PAYMENT_RETRIES: 1,    // Job retry attempts
  PAYMENT_QUERY_LIMIT: 2,    // Payment history limit
}
```

### **Customer Requirements**
- Status must be `"active"`
- Must have at least one booking
- Email address must be valid
- Notification preferences respected

## 🔧 **API Reference**

### **Trigger Endpoint**
```
POST /api/custom/jobs/trigger-rent-reminder
Authorization: Bearer {JOB_TRIGGER_API_TOKEN}
Content-Type: application/json

{
  "dryRun": false  // Optional: test mode
}
```

### **Response Format**
```json
{
  "success": true,
  "message": "Customer rent reminder notification scheduled successfully",
  "jobId": "job_12345"
}
```

## 🎯 **Business Logic**

### **Payment Processing Flow**
1. **Fetch Active Customers**: Get all customers with `status: "active"`
2. **Check Bookings**: Process each customer's active bookings
3. **Payment History**: Retrieve recent payment records
4. **Calculate Amounts**: Include base rent + food charges if applicable
5. **Determine Actions**: Create payments and/or send notifications
6. **Execute**: Process all customers in parallel

### **Notification Triggers**
- **New Payment Due**: No payment for current month → Gentle reminder + create payment record
- **Late Payment**: Payment overdue (after 7th) → Late payment warning
- **Gentle Follow-up**: Payment notified but not completed → Gentle reminder

## 🔒 **Security Features**

### **Authentication**
- API endpoint requires bearer token authentication
- Environment variable validation
- Admin-level access control

### **Rate Limiting**
- Request rate limiting implemented
- Error handling and graceful failures
- Input validation and sanitization

### **Data Protection**
- Secure token handling
- Masked sensitive data in logs
- Environment variable isolation

## 📊 **Monitoring & Logging**

### **Log Categories**
- `🚀 [ROUTE-xxxxx]` - API endpoint logs
- `🚀 [TASK-xxxxx]` - Job execution logs
- `👤 [TASK]` - Customer processing
- `📧 [TASK]` - Email operations
- `💰 [TASK]` - Payment operations
- `📊 [TASK]` - Analytics and summaries

### **Status Checking**
```bash
# Check job queue and system status
npm run rent-reminders:status
```

### **Admin Panel**
- View job queue: `http://localhost:3000/admin`
- Navigate to "Jobs" collection
- Monitor execution status and results

## 🚀 **Deployment & Automation**

### **Development**
```bash
# Manual execution
npm run rent-reminders
```

### **Production - Linux/macOS (Cron)**
```bash
# Daily at 9 AM
0 9 * * * cd /path/to/app && npm run rent-reminders >> logs/rent-reminders.log 2>&1
```

### **Production - Windows (Task Scheduler)**
```cmd
schtasks /create /tn "RentReminders" /tr "cmd.exe /c cd /d \"C:\path\to\app\" && npm run rent-reminders" /sc daily /st 09:00
```

### **Docker**
```dockerfile
# Add to your Dockerfile
RUN echo "0 9 * * * cd /app && npm run rent-reminders" | crontab -
```

### **CI/CD (GitHub Actions)**
```yaml
name: Daily Rent Reminders
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  rent-reminders:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run rent-reminders
        env:
          JOB_TRIGGER_API_TOKEN: ${{ secrets.JOB_TRIGGER_API_TOKEN }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
```

## 🧪 **Testing**

### **Pre-flight Checks**
1. **Environment**: All required variables set
2. **Database**: Connection successful
3. **Email Service**: Resend API accessible
4. **API Endpoint**: Authentication working

### **Test Scenarios**
```bash
# Test without execution
npm run rent-reminders:dry-run

# Test with detailed logs
npm run rent-reminders:verbose --dry-run

# Check system status
npm run rent-reminders:status
```

### **Verification**
1. **Job Creation**: Check admin panel for queued jobs
2. **Email Delivery**: Monitor Resend dashboard
3. **Payment Records**: Verify database entries
4. **Customer Notifications**: Confirm email receipt

## 🔧 **Troubleshooting**

### **Common Issues**

#### **401 Unauthorized**
- Check `JOB_TRIGGER_API_TOKEN` environment variable
- Verify token matches in `.env` file

#### **404 Not Found**
- Ensure development server is running
- Check `NEXT_PUBLIC_SITE_URL` points to correct URL

#### **Email Not Sending**
- Verify `RESEND_API_KEY` is valid
- Check sender domain verification in Resend
- Confirm `RESEND_FROM_ADDRESS` is from verified domain

#### **No Customers Processed**
- Verify customers have `status: "active"`
- Check customers have associated bookings
- Confirm notification preferences allow email

### **Debug Commands**
```bash
# Verbose logging
npm run rent-reminders:verbose

# System status
npm run rent-reminders:status

# Help information
npm run rent-reminders:help
```

## 📈 **Performance**

### **Metrics**
- **Execution Time**: Typically 100-500ms per customer
- **Memory Usage**: Minimal, processes in parallel
- **Database Impact**: Optimized queries with limits
- **Email Rate**: Respects Resend API limits

### **Scalability**
- **Parallel Processing**: All customers processed simultaneously
- **Error Isolation**: Individual failures don't stop entire job
- **Retry Mechanism**: Automatic retry on transient failures
- **Resource Efficient**: Minimal memory footprint

## 📚 **Related Documentation**

- [API Documentation](../src/app/api/custom/jobs/trigger-rent-reminder/README.md)
- [Windows Setup Guide](../scripts/WINDOWS_SETUP.md)
- [Scripts Documentation](../scripts/README.md)
- [Payload CMS Jobs](https://payloadcms.com/docs/jobs)
- [Resend Email Service](https://resend.com/docs)

## 🎉 **Success Indicators**

✅ **System is working when you see:**
- Jobs created in admin panel
- Email delivery confirmations in Resend dashboard
- Payment records created in database
- Customers receiving email notifications
- Execution logs showing successful processing

## 🔄 **Maintenance**

### **Regular Tasks**
- Monitor job execution success rates
- Check email delivery statistics
- Review and rotate API tokens
- Update customer notification preferences
- Monitor system performance metrics

### **Updates**
- Keep dependencies updated
- Review and update email templates
- Adjust payment constants as needed
- Monitor for API changes (Resend, Payload)

---

**Version**: 1.0.0  
**Last Updated**: September 2025  
**Status**: Production Ready ✅
