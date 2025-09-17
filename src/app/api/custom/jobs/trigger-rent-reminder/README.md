# Payment Rent Reminder Notification Task API

This API endpoint allows you to manually trigger the payment rent reminder notification task using Payload's job queue system.

## Endpoint

```
POST /api/custom/jobs/trigger-rent-reminder
```

## Authentication

The endpoint requires admin privileges. Include the admin API token in the Authorization header:

```
Authorization: Bearer YOUR_JOB_TRIGGER_API_TOKEN
```

Set the `JOB_TRIGGER_API_TOKEN` environment variable in your `.env` file.

## POST - Trigger Job

Triggers the payment rent reminder notification task.

### Request Body (Optional)

```json
{
  "dryRun": false     // Test the endpoint without actually executing the job
}
```

### Response

#### Success Response (200)
```json
{
  "success": true,
  "message": "Customer rent reminder notification scheduled successfully"
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Unauthorized access. Admin privileges required.",
  "error": "INSUFFICIENT_PERMISSIONS"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Failed to trigger payment rent reminder notification task.",
  "error": "Error details here"
}
```

## Usage Examples

### Trigger Job (Basic)
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JOB_TRIGGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/custom/jobs/trigger-rent-reminder
```

### Trigger Job with Options
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JOB_TRIGGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}' \
  http://localhost:3000/api/custom/jobs/trigger-rent-reminder
```

### Dry Run (Test)
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JOB_TRIGGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}' \
  http://localhost:3000/api/custom/jobs/trigger-rent-reminder
```

## Environment Variables

Add to your `.env` file:

```env
JOB_TRIGGER_API_TOKEN=your_secure_job_trigger_token_here
```

## Job Behavior

The payment rent reminder notification task will:

1. Fetch all active customers with their bookings
2. Check payment status for each customer
3. Create new payment records if needed
4. Send appropriate email notifications:
   - Gentle reminders for payments due
   - Late payment warnings for overdue payments
5. Process all customers in parallel for better performance
6. Handle errors gracefully without stopping the entire job

## Implementation Notes

This API route uses Payload's built-in job queue system to schedule the payment rent reminder notification task. This approach:
- Leverages Payload's robust job queue infrastructure
- Provides proper job scheduling and execution
- Allows for job monitoring through Payload's admin panel
- Maintains all the same business logic as the scheduled job
- Supports job retry mechanisms and error handling

## Monitoring

You can monitor job execution through:
- Payload CMS admin panel under Jobs section
- Application logs for detailed execution information
- Job status tracking in the database

### Enhanced Logging

The system now provides comprehensive logging with the following features:

#### Route-Level Logging
- **Request Tracking**: Each request gets a unique ID for easy tracking
- **Authentication Logging**: Admin access validation with security details
- **Performance Metrics**: Request duration and timing information
- **Error Tracking**: Detailed error information with stack traces

#### Task-Level Logging
- **Job Execution**: Complete job lifecycle tracking with unique job IDs
- **Customer Processing**: Individual customer and booking processing status
- **Database Operations**: All database queries and operations logged
- **Email Operations**: Email sending status and details
- **Payment Operations**: Payment record creation and updates
- **Performance Analytics**: Success rates, processing times, and statistics

#### Log Format Examples

**Route Logs:**
```
🔐 [ROUTE-abc123] Validating admin access...
✅ [ROUTE-abc123] Admin access validated successfully
🚀 [ROUTE-abc123] Executing rent reminder notification logic...
✅ [ROUTE-abc123] Request completed successfully in 150ms
```

**Task Logs:**
```
🚀 [TASK-xyz789] Starting customer rent reminder notification job...
👥 [TASK-xyz789] Found 25 active customers to process
👤 [TASK-xyz789] Processing customer cust_123 (user@example.com) with 2 bookings
💰 [TASK-xyz789] Creating new payment for customer cust_123
📧 [TASK-xyz789] Sending email to user@example.com: Payment Reminder - Gentle Notice
📊 [TASK-xyz789] Job execution summary: { totalCustomers: 25, successful: 24, failed: 1, successRate: "96%" }
```

#### Log Categories
- 🚀 **Job Start/End**: Job lifecycle events
- 🔐 **Authentication**: Security and access control
- 🔍 **Database**: Data fetching and queries
- 💰 **Payments**: Payment record operations
- 📧 **Email**: Email sending operations
- 📊 **Analytics**: Performance and statistics
- ✅ **Success**: Successful operations
- ❌ **Errors**: Error conditions and failures
- ⚠️ **Warnings**: Non-critical issues
