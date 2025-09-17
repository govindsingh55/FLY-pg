# Windows Setup Guide for Rent Reminders

This guide provides Windows-specific instructions for setting up automated rent reminder notifications.

## Quick Start

### 1. Test the Script

```powershell
# Test with dry run
npm run rent-reminders:dry-run

# Show help
npm run rent-reminders:help
```

### 2. Set Environment Variables

Create or update your `.env` file in the project root:

```env
JOB_TRIGGER_API_TOKEN=your_secure_job_trigger_token_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run the Script

```powershell
# Execute rent reminder job
npm run rent-reminders

# Test run (dry mode)
npm run rent-reminders:dry-run

# Verbose logging
npm run rent-reminders:verbose
```

## Windows Task Scheduler Setup

Since Windows doesn't have cron, you can use Task Scheduler for automation.

### Method 1: Using Task Scheduler GUI

1. Open **Task Scheduler** (`taskschd.msc`)
2. Click **Create Basic Task...**
3. Name: "Rent Reminders Daily"
4. Trigger: **Daily**
5. Time: **9:00 AM** (or your preferred time)
6. Action: **Start a program**
7. Program/script: `cmd.exe`
8. Arguments: `/c cd /d "C:\path\to\your\project" && npm run rent-reminders >> logs\rent-reminders.log 2>&1`
9. Click **Finish**

### Method 2: Using PowerShell Script

Create a PowerShell wrapper script (`scripts/run-rent-reminders.ps1`):

```powershell
# Set working directory
Set-Location "C:\path\to\your\project"

# Create logs directory if it doesn't exist
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
}

# Run the rent reminders script and log output
npm run rent-reminders 2>&1 | Add-Content -Path "logs\rent-reminders.log"
```

Then schedule this PowerShell script:

1. Open **Task Scheduler**
2. Create Basic Task: "Rent Reminders Daily"
3. Trigger: **Daily** at **9:00 AM**
4. Action: **Start a program**
5. Program: `powershell.exe`
6. Arguments: `-File "C:\path\to\your\project\scripts\run-rent-reminders.ps1"`

### Method 3: Using schtasks Command

```cmd
schtasks /create /tn "RentReminders" /tr "cmd.exe /c cd /d \"C:\path\to\your\project\" && npm run rent-reminders >> logs\rent-reminders.log 2>&1" /sc daily /st 09:00
```

## Docker/WSL Alternative

If you prefer Unix-like environment:

### Using WSL (Windows Subsystem for Linux)

1. Install WSL2 with Ubuntu
2. Navigate to your project in WSL
3. Use the regular cron setup:

```bash
# Edit crontab
crontab -e

# Add this line for daily at 9 AM
0 9 * * * cd /mnt/c/path/to/your/project && npm run rent-reminders >> logs/rent-reminders.log 2>&1
```

### Using Docker

Create a `Dockerfile.scheduler`:

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY scripts/ ./scripts/
COPY .env ./

# Install cron
RUN apk add --no-cache dcron

# Add cron job
RUN echo "0 9 * * * cd /app && npm run rent-reminders >> /app/logs/rent-reminders.log 2>&1" > /etc/crontabs/root

CMD ["crond", "-f"]
```

Build and run:

```cmd
docker build -f Dockerfile.scheduler -t rent-scheduler .
docker run -d --name rent-scheduler rent-scheduler
```

## Monitoring and Logs

### View Logs

```powershell
# Create logs directory if it doesn't exist
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }

# View recent logs
Get-Content -Path "logs\rent-reminders.log" -Tail 50

# Monitor logs in real-time (PowerShell 3.0+)
Get-Content -Path "logs\rent-reminders.log" -Wait
```

### Log Rotation (PowerShell)

Create a log rotation script (`scripts/rotate-logs.ps1`):

```powershell
$logFile = "logs\rent-reminders.log"
$maxSize = 10MB
$maxFiles = 5

if (Test-Path $logFile) {
    $file = Get-Item $logFile
    if ($file.Length -gt $maxSize) {
        # Rotate logs
        for ($i = $maxFiles; $i -gt 1; $i--) {
            $oldLog = "$logFile.$($i-1)"
            $newLog = "$logFile.$i"
            if (Test-Path $oldLog) {
                Move-Item $oldLog $newLog -Force
            }
        }
        Move-Item $logFile "$logFile.1" -Force
    }
}
```

Schedule this script to run before the rent reminders:

```cmd
schtasks /create /tn "RentRemindersLogRotate" /tr "powershell.exe -File \"C:\path\to\your\project\scripts\rotate-logs.ps1\"" /sc daily /st 08:55
```

## Troubleshooting

### Common Windows Issues

1. **PowerShell Execution Policy**
   ```powershell
   # Check current policy
   Get-ExecutionPolicy
   
   # Set policy to allow scripts (run as Administrator)
   Set-ExecutionPolicy RemoteSigned
   ```

2. **Path Issues**
   - Use absolute paths in Task Scheduler
   - Use forward slashes or escaped backslashes in scripts
   - Verify Node.js and npm are in PATH

3. **Environment Variables in Task Scheduler**
   - Task Scheduler doesn't load user environment variables
   - Set variables directly in the script or use a batch file

4. **Permissions**
   - Ensure the user account has permissions to run the task
   - Use "Run with highest privileges" if needed

### Testing Scheduled Tasks

```powershell
# Test the task manually
schtasks /run /tn "RentReminders"

# Check task status
schtasks /query /tn "RentReminders"

# View task history
Get-WinEvent -LogName "Microsoft-Windows-TaskScheduler/Operational" | Where-Object {$_.Message -like "*RentReminders*"}
```

## Environment Variables for Task Scheduler

Create a batch file wrapper (`scripts/run-rent-reminders.bat`):

```batch
@echo off
cd /d "%~dp0\.."

REM Set environment variables
set JOB_TRIGGER_API_TOKEN=your_token_here
set NEXT_PUBLIC_SITE_URL=http://localhost:3000

REM Create logs directory
if not exist "logs" mkdir "logs"

REM Run the script
npm run rent-reminders >> logs\rent-reminders.log 2>&1
```

Then schedule the batch file instead of the npm command directly.

## Security Considerations

1. **API Token Security**
   - Store tokens in environment variables, not in scripts
   - Use Windows Credential Manager for sensitive data
   - Restrict file permissions on scripts containing tokens

2. **Task Scheduler Security**
   - Run tasks with minimal required privileges
   - Use service accounts for production environments
   - Enable task history for auditing

## Production Deployment

For production Windows servers:

1. Use Windows Service instead of Task Scheduler
2. Implement proper logging and monitoring
3. Set up alerts for failed executions
4. Use configuration management tools (PowerShell DSC, etc.)
5. Consider using Windows Container for isolation

## Alternative: Windows Service

For more robust production deployment, consider creating a Windows Service that runs the rent reminders on schedule. This provides better reliability and monitoring capabilities than Task Scheduler.
