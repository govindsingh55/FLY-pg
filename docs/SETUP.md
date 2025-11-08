# Setup Guide# Rent Reminder System - Setup Guide



> **Last Updated**: November 2025  Quick setup guide for the automated rent reminder notification system.

> **Project**: FLY-pg Property Management System

## 🚀 **Quick Setup (5 minutes)**

---

### **1. Environment Variables**

## 📚 Table of ContentsAdd to your `.env` file:

```env

- [Quick Start](#quick-start)# Required

- [Environment Variables](#environment-variables)JOB_TRIGGER_API_TOKEN=your_secure_token_here

- [Database Setup](#database-setup)RESEND_API_KEY=your_resend_api_key

- [PhonePe Payment Integration](#phonepe-payment-integration)RESEND_FROM_ADDRESS=noreply@yourdomain.com

- [Email Service (Resend)](#email-service-resend)DATABASE_URI=mongodb://localhost:27017/your-database

- [Rent Reminders Setup](#rent-reminders-setup)PAYLOAD_SECRET=your_payload_secret

- [Live Preview Setup](#live-preview-setup)

- [ISR (Incremental Static Regeneration)](#isr-incremental-static-regeneration)# Optional

- [Deployment](#deployment)NEXT_PUBLIC_SITE_URL=http://localhost:3000

- [Verification](#verification)RESEND_FROM_NAME=Your Company Name

- [Troubleshooting](#troubleshooting)```



---### **2. Generate Secure Tokens**

```bash

## 🚀 Quick Start# Generate JOB_TRIGGER_API_TOKEN

node -e "console.log('JOB_TRIGGER_API_TOKEN=' + require('crypto').randomBytes(32).toString('hex'))"

### **Prerequisites**

- Node.js 18+# Generate PAYLOAD_SECRET

- MongoDBnode -e "console.log('PAYLOAD_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

- npm or yarn```



### **Installation**### **3. Setup Email Service**

1. Sign up at [resend.com](https://resend.com)

1. **Clone the repository**2. Get your API key from the dashboard

```bash3. Verify your sending domain

git clone <repository-url>4. Set `RESEND_FROM_ADDRESS` to an email from your verified domain

cd FLY-pg

```### **4. Test the System**

```bash

2. **Install dependencies**# Test without execution

```bashnpm run rent-reminders:dry-run

npm install

```# Check system status

npm run rent-reminders:status

3. **Setup environment variables**

```bash# Execute rent reminders

cp .env.example .envnpm run rent-reminders

``````



4. **Configure environment** (see [Environment Variables](#environment-variables))## 📋 **Verification Checklist**



5. **Start development server**- [ ] Environment variables set

```bash- [ ] Resend email service configured

npm run dev- [ ] Development server running (`npm run dev`)

```- [ ] Database connected

- [ ] Active customers with bookings in database

6. **Access the application**- [ ] Dry run test passes

- Frontend: http://localhost:3000- [ ] Job creation confirmed in admin panel

- Admin Panel: http://localhost:3000/admin

## 🔧 **Automation Setup**

---

### **Linux/macOS (Cron)**

## 🔐 Environment Variables```bash

# Edit crontab

### **Required Variables**crontab -e



Create a `.env` file in the project root with these variables:# Add daily execution at 9 AM

0 9 * * * cd /path/to/your/app && npm run rent-reminders >> logs/rent-reminders.log 2>&1

```env```

# DATABASE

DATABASE_URI=mongodb://localhost:27017/fly-pg### **Windows (Task Scheduler)**

```cmd

# PAYLOAD CMSschtasks /create /tn "RentReminders" /tr "cmd.exe /c cd /d \"C:\path\to\your\project\" && npm run rent-reminders" /sc daily /st 09:00

PAYLOAD_SECRET=<generate-with-command-below>```



# APPLICATION## 🎯 **Success Indicators**

NODE_ENV=development

NEXT_PUBLIC_SITE_URL=http://localhost:3000✅ **System working when you see:**

- `npm run rent-reminders:dry-run` passes

# PHONEPE PAYMENT GATEWAY- Jobs appear in admin panel (`http://localhost:3000/admin`)

PHONEPE_MERCHANT_ID=PGTESTPAYUAT- Email delivery confirmations in Resend dashboard

PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399- Payment records created in database

PHONEPE_KEY_INDEX=1

PHONEPE_BASE_URL=https://api-uat.phonepe.com/apis/hermes## 🔧 **Troubleshooting**

PHONEPE_ENV=UAT

| Issue | Solution |

# EMAIL SERVICE (RESEND)|-------|----------|

RESEND_API_KEY=<your-resend-api-key>| 401 Unauthorized | Check `JOB_TRIGGER_API_TOKEN` in `.env` |

RESEND_FROM_ADDRESS=noreply@yourdomain.com| 404 Not Found | Ensure `npm run dev` is running |

RESEND_FROM_NAME=FLY-pg Property Management| Email not sending | Verify Resend API key and domain |

| No customers processed | Check customers have `status: "active"` |

# RENT REMINDER JOB

JOB_TRIGGER_API_TOKEN=<generate-with-command-below>## 📚 **Next Steps**



# LIVE PREVIEW (OPTIONAL)1. **Read full documentation**: [RENT_REMINDERS.md](./RENT_REMINDERS.md)

PREVIEW_SECRET=<generate-with-command-below>2. **Set up monitoring**: Check admin panel regularly

3. **Configure automation**: Set up cron job or Task Scheduler

# ISR REVALIDATION (OPTIONAL)4. **Test with real data**: Ensure customers receive notifications

REVALIDATION_SECRET=<generate-with-command-below>

```---



### **Generate Secure Tokens****Need help?** Check the [troubleshooting section](./RENT_REMINDERS.md#troubleshooting) in the main documentation.


```bash
node -e "console.log('PAYLOAD_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JOB_TRIGGER_API_TOKEN=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('PREVIEW_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('REVALIDATION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Database Setup

### **Local MongoDB**

1. **Install MongoDB**
2. **Start MongoDB**
3. **Verify connection**

### **MongoDB Atlas (Cloud)**

1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Update `.env` accordingly

### **Seed Database**

```bash
curl -X POST http://localhost:3000/api/seed
```

---

## 💳 PhonePe Payment Integration

### **UAT (Testing) Setup**

- Pre-configured for PhonePe UAT testing
- Test VPAs: `success@ybl`, `failed@ybl`, `pending@ybl`
- Test Cards: `4208 5851 9011 6667` (Credit), `4242 4242 4242 4242` (Debit)

### **Production Setup**

- Get production credentials from PhonePe
- Update environment variables
- Configure webhooks with PhonePe support

---

## 📧 Email Service (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get API Key and verify sending domain
3. Set `RESEND_FROM_ADDRESS` to a verified domain email

---

## 🔔 Rent Reminders Setup

- Configure environment variables
- Test with `npm run rent-reminders:dry-run`
- Schedule with cron (Linux/macOS) or Task Scheduler (Windows)

---

## 👁️ Live Preview Setup

- Add `NEXT_PUBLIC_SITE_URL` and `PREVIEW_SECRET` to `.env`
- Restart dev server
- Preview icon appears in Payload admin

---

## 🔄 ISR (Incremental Static Regeneration)

- Add `REVALIDATION_SECRET` to `.env`
- Build and start app
- Home page revalidates every 60 seconds or on property changes

---

## 🚀 Deployment

### **Docker**

```bash
docker-compose up -d
docker build -t fly-pg .
docker run -p 3000:3000 --env-file .env fly-pg
```

### **Dokploy**

- Add persistent volume at `/app/media`
- Migrate existing media if needed

---

## ✅ Verification

- Dependencies installed
- Environment variables configured
- MongoDB connected
- Dev server running
- Admin panel accessible
- Database seeded
- Payment flow works
- Rent reminders dry-run passes

---

## 🔧 Troubleshooting

- **Build errors**: Clear `.next` and `node_modules`, reinstall, rebuild
- **Type errors**: Run `npm run generate:types`
- **Database issues**: Check MongoDB is running and URI is correct
- **Email not sending**: Check Resend API key and sender domain
- **PhonePe issues**: Check credentials and callback URL
- **Rent reminders not running**: Check `JOB_TRIGGER_API_TOKEN` and server logs

---

## 🔗 Related Documentation

- [DEVELOPMENT.md](./DEVELOPMENT.md)
- [API.md](./API.md)
- [RENT_REMINDERS.md](./RENT_REMINDERS.md)
- [SECURITY.md](./SECURITY.md)
- [README.md](../README.md)
