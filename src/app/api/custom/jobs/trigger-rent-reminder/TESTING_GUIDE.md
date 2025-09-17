# Payment Rent Reminder Notification Task API - Testing Guide

This guide provides comprehensive testing instructions for the Payment Rent Reminder Notification Task API.

## 🚀 Quick Start

### 1. Setup Environment Variables

Add to your `.env` file:
```env
JOB_TRIGGER_API_TOKEN=your_secure_job_trigger_token_here
```

### 2. Update Test Configuration

Edit the `test.http` file and update:
```http
@baseUrl = http://localhost:3000
@apiToken = your_actual_job_trigger_api_token_here
```

### 3. Start Your Application

```bash
npm run dev
# or
yarn dev
```

## 📋 Test Scenarios

### ✅ **Basic Functionality Tests**

#### Test 1: Basic Job Trigger (Success)
- **Purpose**: Verify the API works with valid authentication
- **Expected**: 200 OK with job queued successfully
- **Logs**: Should show route and task execution logs

#### Test 2: Job Trigger with Dry Run
- **Purpose**: Test dry run functionality without executing the job
- **Expected**: 200 OK with dry run success message
- **Logs**: Should show dry run mode in route logs

#### Test 3: Job Trigger with Dry Run False (Explicit)
- **Purpose**: Explicitly set dryRun to false
- **Expected**: 200 OK with actual job execution
- **Logs**: Should show full job execution logs

### 🔐 **Authentication Tests**

#### Test 4: Unauthorized Access (No Token)
- **Purpose**: Test API security without authentication
- **Expected**: 401 Unauthorized
- **Logs**: Should show unauthorized access attempt

#### Test 5: Unauthorized Access (Invalid Token)
- **Purpose**: Test with wrong token
- **Expected**: 401 Unauthorized
- **Logs**: Should show authentication failure

#### Test 6: Unauthorized Access (Wrong Token Format)
- **Purpose**: Test with malformed authorization header
- **Expected**: 401 Unauthorized
- **Logs**: Should show authentication failure

### 🛡️ **Input Validation Tests**

#### Test 7: Missing Content-Type Header
- **Purpose**: Test without Content-Type header
- **Expected**: Should work (API handles missing body gracefully)
- **Logs**: Should show no request body provided

#### Test 8: Invalid JSON Body
- **Purpose**: Test with invalid JSON structure
- **Expected**: Should work (API ignores invalid fields)
- **Logs**: Should show request body parsing

#### Test 9: Empty JSON Body
- **Purpose**: Test with empty JSON object
- **Expected**: 200 OK with default values
- **Logs**: Should show default parameter usage

#### Test 10: Extra Parameters
- **Purpose**: Test with additional parameters
- **Expected**: 200 OK (extra params ignored)
- **Logs**: Should show only recognized parameters

### ⚡ **Performance Tests**

#### Test 11: Multiple Dry Run Tests
- **Purpose**: Test API performance with multiple requests
- **Expected**: All requests should succeed quickly
- **Logs**: Should show consistent performance metrics

#### Test 13: Stress Test (Concurrent Requests)
- **Purpose**: Test API under concurrent load
- **Expected**: All requests should be handled properly
- **Logs**: Should show request IDs and timing

### 🔍 **Edge Case Tests**

#### Test 14: Large Request Body
- **Purpose**: Test with larger JSON payload
- **Expected**: 200 OK (extra data ignored)
- **Logs**: Should show request body parsing

#### Test 15: Special Characters in Token
- **Purpose**: Test token validation with special characters
- **Expected**: 401 Unauthorized
- **Logs**: Should show authentication failure

#### Test 16: Very Long Token
- **Purpose**: Test with extremely long token
- **Expected**: 401 Unauthorized
- **Logs**: Should show authentication failure

#### Test 17: Unicode Characters
- **Purpose**: Test with Unicode characters in request
- **Expected**: 200 OK
- **Logs**: Should handle Unicode properly

#### Test 18: Null Values
- **Purpose**: Test with null values
- **Expected**: 200 OK (null treated as falsy)
- **Logs**: Should show default parameter usage

#### Test 19: Array Instead of Object
- **Purpose**: Test with array instead of object
- **Expected**: Should work (API handles gracefully)
- **Logs**: Should show request body parsing

#### Test 20: Nested Object
- **Purpose**: Test with nested object structure
- **Expected**: 200 OK (nested data ignored)
- **Logs**: Should show only top-level parameters

## 📊 **Expected Response Formats**

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Payment rent reminder notification task executed successfully.",
  "result": {
    "success": true,
    "message": "Customer rent reminder notification scheduled successfully",
    "jobId": "job_123456789"
  }
}
```

### Dry Run Response (200 OK)
```json
{
  "success": true,
  "message": "Dry run completed. Job would be triggered successfully."
}
```

### Unauthorized Response (401 Unauthorized)
```json
{
  "success": false,
  "message": "Unauthorized access. Admin privileges required.",
  "error": "INSUFFICIENT_PERMISSIONS"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Failed to trigger payment rent reminder notification task.",
  "error": "Error details here"
}
```

## 🔍 **Log Monitoring**

### Route-Level Logs
Look for logs with `[ROUTE-xxxxx]` prefix:
```
🔐 [ROUTE-abc123] Validating admin access...
✅ [ROUTE-abc123] Admin access validated successfully
🚀 [ROUTE-abc123] Executing rent reminder notification logic...
✅ [ROUTE-abc123] Job queued successfully: { jobId: "job_456" }
✅ [ROUTE-abc123] Request completed successfully in 150ms
```

### Task-Level Logs
Look for logs with `[TASK-xxxxx]` prefix:
```
🚀 [TASK-xyz789] Starting customer rent reminder notification job...
👥 [TASK-xyz789] Found 25 active customers to process
👤 [TASK-xyz789] Processing customer cust_123 (user@example.com) with 2 bookings
💰 [TASK-xyz789] Creating new payment for customer cust_123
📧 [TASK-xyz789] Sending email to user@example.com: Payment Reminder - Gentle Notice
📊 [TASK-xyz789] Job execution summary: { totalCustomers: 25, successful: 24, failed: 1, successRate: "96%" }
```

## 🧪 **Testing Tools**

### VS Code REST Client
1. Install the "REST Client" extension
2. Open `test.http` file
3. Click "Send Request" above each test

### Postman
1. Import the requests from `test.http`
2. Set up environment variables
3. Run the test collection

### cURL Commands
```bash
# Basic test
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/custom/jobs/trigger-rent-reminder

# Dry run test
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}' \
  http://localhost:3000/api/custom/jobs/trigger-rent-reminder
```

## 🚨 **Troubleshooting**

### Common Issues

1. **401 Unauthorized**
   - Check `JOB_TRIGGER_API_TOKEN` environment variable
   - Verify token is correctly set in test file
   - Ensure token matches exactly

2. **500 Internal Server Error**
   - Check application logs for detailed error information
   - Verify database connection
   - Check Payload configuration

3. **Job Not Executing**
   - Check Payload admin panel for job status
   - Verify job queue is running
   - Check database for job records

4. **Slow Performance**
   - Monitor logs for performance metrics
   - Check database query performance
   - Verify server resources

### Debug Steps

1. **Check Environment Variables**
   ```bash
   echo $JOB_TRIGGER_API_TOKEN
   ```

2. **Check Application Logs**
   ```bash
   # If using PM2
   pm2 logs your-app-name
   
   # If using Docker
   docker logs your-container-name
   ```

3. **Check Database**
   - Verify customers exist with `status: 'active'`
   - Check payments collection for recent records
   - Verify job records in payload-jobs collection

## 📈 **Performance Benchmarks**

### Expected Performance
- **Dry Run**: < 100ms
- **Job Queuing**: < 200ms
- **Job Execution**: 1-5 seconds (depending on customer count)

### Load Testing
- **Concurrent Requests**: Should handle 10+ concurrent requests
- **Memory Usage**: Should remain stable under load
- **Error Rate**: Should be < 1% under normal conditions

## 🔄 **Continuous Testing**

### Automated Testing
Consider setting up automated tests that:
1. Run basic functionality tests
2. Monitor performance metrics
3. Check error rates
4. Validate log output

### Monitoring
Set up monitoring for:
- API response times
- Error rates
- Job execution success rates
- Database performance

## 📝 **Test Results Template**

```
Test Date: ___________
Environment: ___________
Tester: ___________

Basic Functionality:
- [ ] Test 1: Basic Job Trigger
- [ ] Test 2: Dry Run
- [ ] Test 3: Explicit Dry Run False

Authentication:
- [ ] Test 4: No Token
- [ ] Test 5: Invalid Token
- [ ] Test 6: Wrong Format

Input Validation:
- [ ] Test 7: Missing Content-Type
- [ ] Test 8: Invalid JSON
- [ ] Test 9: Empty JSON
- [ ] Test 10: Extra Parameters

Performance:
- [ ] Test 11: Multiple Dry Runs
- [ ] Test 13: Concurrent Requests

Edge Cases:
- [ ] Test 14: Large Request Body
- [ ] Test 15: Special Characters
- [ ] Test 16: Long Token
- [ ] Test 17: Unicode
- [ ] Test 18: Null Values
- [ ] Test 19: Array Input
- [ ] Test 20: Nested Object

Issues Found:
- [ ] Issue 1: ___________
- [ ] Issue 2: ___________

Performance Notes:
- Average Response Time: ___________
- Error Rate: ___________
- Memory Usage: ___________
```
