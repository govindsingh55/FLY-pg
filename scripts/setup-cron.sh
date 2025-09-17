#!/bin/bash

# Rent Reminders Cron Setup Script
# This script helps set up automated rent reminder notifications using cron

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_title() {
    echo -e "\n${GREEN}🚀 $1${NC}\n"
}

# Get the absolute path of the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"

log_title "Rent Reminders Cron Setup"

log_info "Project directory: $PROJECT_DIR"

# Check if we're in the right directory
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    log_error "package.json not found. Please run this script from the project root or scripts directory."
    exit 1
fi

# Check if the rent-reminders script exists
if [ ! -f "$PROJECT_DIR/scripts/trigger-rent-reminders.js" ]; then
    log_error "trigger-rent-reminders.js not found in scripts directory."
    exit 1
fi

# Create logs directory if it doesn't exist
if [ ! -d "$LOG_DIR" ]; then
    log_info "Creating logs directory: $LOG_DIR"
    mkdir -p "$LOG_DIR"
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed or not in PATH."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed or not in PATH."
    exit 1
fi

log_success "Environment checks passed"

# Test the script first
log_info "Testing rent reminders script..."
if cd "$PROJECT_DIR" && npm run rent-reminders:dry-run > /dev/null 2>&1; then
    log_success "Rent reminders script test passed"
else
    log_error "Rent reminders script test failed. Please check your configuration."
    log_info "Try running: npm run rent-reminders:dry-run"
    exit 1
fi

# Cron job options
echo ""
log_info "Choose a schedule for rent reminders:"
echo "1) Daily at 9:00 AM"
echo "2) Daily at 8:00 AM"
echo "3) Every Monday at 9:00 AM (weekly)"
echo "4) 1st and 15th of each month at 9:00 AM"
echo "5) Custom schedule"
echo "6) Just show the cron commands (don't install)"

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        CRON_SCHEDULE="0 9 * * *"
        DESCRIPTION="Daily at 9:00 AM"
        ;;
    2)
        CRON_SCHEDULE="0 8 * * *"
        DESCRIPTION="Daily at 8:00 AM"
        ;;
    3)
        CRON_SCHEDULE="0 9 * * 1"
        DESCRIPTION="Every Monday at 9:00 AM"
        ;;
    4)
        CRON_SCHEDULE="0 9 1,15 * *"
        DESCRIPTION="1st and 15th of each month at 9:00 AM"
        ;;
    5)
        echo ""
        log_info "Enter custom cron schedule (e.g., '0 9 * * *' for daily at 9 AM):"
        read -p "Cron schedule: " CRON_SCHEDULE
        DESCRIPTION="Custom schedule: $CRON_SCHEDULE"
        ;;
    6)
        SHOW_ONLY=true
        ;;
    *)
        log_error "Invalid choice"
        exit 1
        ;;
esac

# Create the cron command
CRON_COMMAND="cd $PROJECT_DIR && npm run rent-reminders >> $LOG_DIR/rent-reminders.log 2>&1"

if [ "$SHOW_ONLY" = true ]; then
    echo ""
    log_info "Here are example cron commands you can use:"
    echo ""
    echo "# Daily at 9:00 AM"
    echo "0 9 * * * cd $PROJECT_DIR && npm run rent-reminders >> $LOG_DIR/rent-reminders.log 2>&1"
    echo ""
    echo "# Daily at 8:00 AM"
    echo "0 8 * * * cd $PROJECT_DIR && npm run rent-reminders >> $LOG_DIR/rent-reminders.log 2>&1"
    echo ""
    echo "# Every Monday at 9:00 AM"
    echo "0 9 * * 1 cd $PROJECT_DIR && npm run rent-reminders >> $LOG_DIR/rent-reminders.log 2>&1"
    echo ""
    echo "# 1st and 15th of each month at 9:00 AM"
    echo "0 9 1,15 * * cd $PROJECT_DIR && npm run rent-reminders >> $LOG_DIR/rent-reminders.log 2>&1"
    echo ""
    log_info "To install a cron job, run: crontab -e"
    log_info "Then add one of the above lines to your crontab."
    echo ""
    log_info "Log files will be written to: $LOG_DIR/rent-reminders.log"
    exit 0
fi

# Confirm the schedule
echo ""
log_info "Schedule: $DESCRIPTION"
log_info "Cron schedule: $CRON_SCHEDULE"
log_info "Command: $CRON_COMMAND"
log_info "Logs will be written to: $LOG_DIR/rent-reminders.log"
echo ""

read -p "Do you want to install this cron job? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    log_info "Cron job installation cancelled."
    exit 0
fi

# Check if cron job already exists
EXISTING_CRON=$(crontab -l 2>/dev/null | grep -F "rent-reminders" || true)

if [ -n "$EXISTING_CRON" ]; then
    log_warning "Found existing rent-reminders cron job:"
    echo "$EXISTING_CRON"
    echo ""
    read -p "Do you want to replace it? (y/N): " replace_confirm
    
    if [[ ! $replace_confirm =~ ^[Yy]$ ]]; then
        log_info "Keeping existing cron job. Installation cancelled."
        exit 0
    fi
    
    # Remove existing rent-reminders cron jobs
    log_info "Removing existing rent-reminders cron jobs..."
    (crontab -l 2>/dev/null | grep -v "rent-reminders" || true) | crontab -
fi

# Add the new cron job
log_info "Installing cron job..."
(crontab -l 2>/dev/null; echo "$CRON_SCHEDULE $CRON_COMMAND") | crontab -

# Verify the installation
if crontab -l | grep -F "rent-reminders" > /dev/null; then
    log_success "Cron job installed successfully!"
    echo ""
    log_info "Schedule: $DESCRIPTION"
    log_info "The rent reminder job will run automatically according to the schedule."
    log_info "Logs will be written to: $LOG_DIR/rent-reminders.log"
    echo ""
    log_info "To view current cron jobs: crontab -l"
    log_info "To remove this cron job: crontab -e (then delete the rent-reminders line)"
    log_info "To view logs: tail -f $LOG_DIR/rent-reminders.log"
else
    log_error "Failed to install cron job"
    exit 1
fi

# Create a log rotation config (optional)
read -p "Do you want to set up log rotation for rent-reminders.log? (y/N): " logrotate_confirm

if [[ $logrotate_confirm =~ ^[Yy]$ ]]; then
    LOGROTATE_CONFIG="/etc/logrotate.d/rent-reminders"
    
    log_info "Creating logrotate configuration..."
    
    # Check if we have sudo access
    if sudo -n true 2>/dev/null; then
        sudo tee "$LOGROTATE_CONFIG" > /dev/null <<EOF
$LOG_DIR/rent-reminders.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 $(whoami) $(whoami)
}
EOF
        log_success "Logrotate configuration created: $LOGROTATE_CONFIG"
        log_info "Logs will be rotated daily and kept for 30 days."
    else
        log_warning "Sudo access required for logrotate configuration."
        log_info "You can manually create the logrotate config later if needed."
    fi
fi

echo ""
log_success "Setup complete!"
log_info "Your rent reminder notifications are now automated."
echo ""
log_info "Next steps:"
log_info "1. Monitor the first few runs: tail -f $LOG_DIR/rent-reminders.log"
log_info "2. Check your email configuration is working properly"
log_info "3. Verify customers are receiving notifications"
echo ""
log_info "For troubleshooting, run: npm run rent-reminders:dry-run"
