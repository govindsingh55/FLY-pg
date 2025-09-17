# Scripts Directory

Utility scripts for the FLY PG application rent reminder system.

## 🚀 Quick Reference

### Main Commands
```bash
npm run rent-reminders              # Execute rent reminders
npm run rent-reminders:dry-run      # Test without execution  
npm run rent-reminders:verbose      # Detailed logging
npm run rent-reminders:status       # Check system status
npm run rent-reminders:help         # Show help
```

## Rent Reminder Script (`trigger-rent-reminders.js`)

### Core Features
- ✅ **Production execution** with comprehensive error handling
- ✅ **Dry run mode** for safe testing
- ✅ **Verbose logging** for debugging and monitoring  
- ✅ **Environment validation** with helpful error messages
- ✅ **Colored output** for better readability
- ✅ **Built-in help** and usage documentation

### Direct Script Usage

```bash
# Basic execution
node scripts/trigger-rent-reminders.js

# Dry run (test mode)
node scripts/trigger-rent-reminders.js --dry-run

# Verbose logging
node scripts/trigger-rent-reminders.js --verbose

# Dry run with verbose logging
node scripts/trigger-rent-reminders.js --dry-run --verbose

# Show help
node scripts/trigger-rent-reminders.js --help
```

### Environment Variables Required

```env
# Required: API token for authentication
JOB_TRIGGER_API_TOKEN=your_secure_job_trigger_token_here

# Optional: Base URL (defaults to http://localhost:3000)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Features

- ✅ **Dry Run Mode**: Test the script without executing the actual job
- ✅ **Verbose Logging**: Detailed logging for debugging and monitoring
- ✅ **Error Handling**: Comprehensive error handling with helpful messages
- ✅ **Environment Validation**: Validates required environment variables
- ✅ **Colored Output**: Color-coded console output for better readability
- ✅ **Signal Handling**: Graceful handling of SIGINT and SIGTERM
- ✅ **Help Documentation**: Built-in help and usage information

### Automation Examples

#### Cron Job (Daily at 9 AM)
```bash
# Add to crontab: crontab -e
0 9 * * * cd /path/to/your/app && npm run rent-reminders >> /var/log/rent-reminders.log 2>&1
```

#### Systemd Timer (Daily)
```ini
# /etc/systemd/system/rent-reminders.timer
[Unit]
Description=Daily Rent Reminders
Requires=rent-reminders.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```ini
# /etc/systemd/system/rent-reminders.service
[Unit]
Description=Rent Reminder Notification Service
After=network.target

[Service]
Type=oneshot
User=your-app-user
WorkingDirectory=/path/to/your/app
ExecStart=/usr/bin/npm run rent-reminders
Environment=NODE_ENV=production
```

#### GitHub Actions (Scheduled)
```yaml
name: Daily Rent Reminders
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  rent-reminders:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run rent-reminders
        env:
          JOB_TRIGGER_API_TOKEN: ${{ secrets.JOB_TRIGGER_API_TOKEN }}
          NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
```

### Script Output Examples

#### Successful Execution
```
🚀 Rent Reminder Notification Trigger

ℹ Validating environment...
ℹ Preparing API request...
ℹ Triggering rent reminder notification job...
✅ Job trigger completed successfully!
ℹ ✓ Job queued with ID: job_abc123
ℹ ✓ Rent reminder notifications will be processed
ℹ ✓ Check application logs for detailed execution status

Summary:
  • Mode: Live Execution
  • Duration: 245ms
  • Status: Success

💡 Monitor your application logs to track job execution progress.
💡 Check the Payload CMS admin panel for job status details.
```

#### Dry Run Output
```
🚀 Rent Reminder Notification Trigger

⚠ Running in DRY RUN mode - no actual job will be executed
ℹ Validating environment...
ℹ Preparing API request...
ℹ Testing rent reminder notification job...
✅ Dry run completed successfully!
ℹ ✓ API endpoint is accessible
ℹ ✓ Authentication is valid
ℹ ✓ Request format is correct
ℹ ✓ Job would be triggered successfully

Summary:
  • Mode: Dry Run
  • Duration: 156ms
  • Status: Success
```

#### Error Output
```
🚀 Rent Reminder Notification Trigger

ℹ Validating environment...
❌ Environment validation failed:
❌   • JOB_TRIGGER_API_TOKEN environment variable is required
ℹ Please check your .env file and ensure all required variables are set.
```

### Monitoring and Logging

The script provides comprehensive logging:

- **Info Messages** (ℹ): General information and progress updates
- **Success Messages** (✅): Successful operations and completions
- **Warning Messages** (⚠): Non-critical issues and dry run notifications
- **Error Messages** (❌): Failures and validation errors
- **Debug Messages** (🔍): Detailed information (verbose mode only)

### Troubleshooting

#### Common Issues

1. **Authentication Failed (401)**
   - Check `JOB_TRIGGER_API_TOKEN` environment variable
   - Verify token is correct and not expired

2. **Connection Refused**
   - Ensure your application is running
   - Check `NEXT_PUBLIC_SITE_URL` is correct
   - Verify network connectivity

3. **API Endpoint Not Found (404)**
   - Check `NEXT_PUBLIC_SITE_URL` is correct
   - Verify the API endpoint exists and is deployed

4. **Server Error (500)**
   - Check application logs for detailed error information
   - Verify database connectivity
   - Check Payload configuration

#### Debug Mode

Use verbose mode for detailed debugging:
```bash
npm run rent-reminders:verbose
```

This will show:
- Request/response details
- Full error stack traces
- Environment variable values (partially masked)
- API response data

### Integration with CI/CD

The script is designed to work well with CI/CD pipelines:

- **Exit Codes**: Returns appropriate exit codes (0 for success, 1 for failure)
- **Environment Variables**: Uses standard environment variable patterns
- **Logging**: Structured logging suitable for log aggregation
- **Error Handling**: Comprehensive error handling with detailed messages

### Security Considerations

- API tokens are partially masked in logs
- No sensitive data is logged in non-verbose mode
- Environment variables are validated but not logged
- Secure HTTP headers are used for API requests

### Performance

- Lightweight script with minimal dependencies
- Fast execution (typically < 500ms)
- Efficient error handling
- Minimal memory footprint
