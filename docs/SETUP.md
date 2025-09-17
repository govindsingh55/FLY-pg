# Rent Reminder System - Setup Guide

Quick setup guide for the automated rent reminder notification system.

## 🚀 **Quick Setup (5 minutes)**

### **1. Environment Variables**
Add to your `.env` file:
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

### **2. Generate Secure Tokens**
```bash
# Generate JOB_TRIGGER_API_TOKEN
node -e "console.log('JOB_TRIGGER_API_TOKEN=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate PAYLOAD_SECRET
node -e "console.log('PAYLOAD_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### **3. Setup Email Service**
1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Verify your sending domain
4. Set `RESEND_FROM_ADDRESS` to an email from your verified domain

### **4. Test the System**
```bash
# Test without execution
npm run rent-reminders:dry-run

# Check system status
npm run rent-reminders:status

# Execute rent reminders
npm run rent-reminders
```

## 📋 **Verification Checklist**

- [ ] Environment variables set
- [ ] Resend email service configured
- [ ] Development server running (`npm run dev`)
- [ ] Database connected
- [ ] Active customers with bookings in database
- [ ] Dry run test passes
- [ ] Job creation confirmed in admin panel

## 🔧 **Automation Setup**

### **Linux/macOS (Cron)**
```bash
# Edit crontab
crontab -e

# Add daily execution at 9 AM
0 9 * * * cd /path/to/your/app && npm run rent-reminders >> logs/rent-reminders.log 2>&1
```

### **Windows (Task Scheduler)**
```cmd
schtasks /create /tn "RentReminders" /tr "cmd.exe /c cd /d \"C:\path\to\your\project\" && npm run rent-reminders" /sc daily /st 09:00
```

## 🎯 **Success Indicators**

✅ **System working when you see:**
- `npm run rent-reminders:dry-run` passes
- Jobs appear in admin panel (`http://localhost:3000/admin`)
- Email delivery confirmations in Resend dashboard
- Payment records created in database

## 🔧 **Troubleshooting**

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check `JOB_TRIGGER_API_TOKEN` in `.env` |
| 404 Not Found | Ensure `npm run dev` is running |
| Email not sending | Verify Resend API key and domain |
| No customers processed | Check customers have `status: "active"` |

## 📚 **Next Steps**

1. **Read full documentation**: [RENT_REMINDERS.md](./RENT_REMINDERS.md)
2. **Set up monitoring**: Check admin panel regularly
3. **Configure automation**: Set up cron job or Task Scheduler
4. **Test with real data**: Ensure customers receive notifications

---

**Need help?** Check the [troubleshooting section](./RENT_REMINDERS.md#troubleshooting) in the main documentation.
