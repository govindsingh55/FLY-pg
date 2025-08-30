# FLY-pg - Property Management System

A comprehensive property management system built with Next.js, Payload CMS, and PhonePe payment integration for PG (Paying Guest) accommodations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- PhonePe UAT credentials (for testing)

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd FLY-pg
   cp .env.example .env
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Database
   DATABASE_URI=mongodb://localhost:27017/fly-pg
   
   # PhonePe (UAT Testing)
   PHONEPE_MERCHANT_ID=PGTESTPAYUAT
   PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
   PHONEPE_KEY_INDEX=1
   PHONEPE_BASE_URL=https://api-uat.phonepe.com/apis/hermes
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Seed Database: Use the "Seed Test Data" button in admin dashboard

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Payload CMS, MongoDB
- **Payments**: PhonePe SDK
- **Testing**: Playwright, Vitest
- **Deployment**: Docker support

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── (frontend)/        # Public frontend routes
│   ├── (payload)/         # Payload CMS admin
│   └── api/               # API routes
├── components/            # React components
│   ├── dashboard/         # Customer dashboard
│   ├── marketing/         # Public marketing pages
│   └── ui/               # Reusable UI components
├── payload/              # Payload CMS configuration
│   ├── collections/      # Data models
│   └── components/       # Admin components
└── lib/                  # Utilities and services
```

## 📊 Features

### Customer Dashboard
- **Profile Management**: Complete profile with address, emergency contacts
- **Booking Management**: View, cancel, extend bookings
- **Payment Management**: Rent payments, auto-pay, payment history
- **Support System**: Ticket management with real-time chat
- **Notifications**: Real-time notifications and preferences

### Admin Panel
- **Property Management**: Properties, rooms, amenities
- **User Management**: Customers, staff, roles
- **Booking Management**: Booking lifecycle, status updates
- **Payment Management**: Payment tracking, refunds
- **Support Management**: Ticket resolution, customer support

### Payment Integration
- **PhonePe Integration**: UPI, cards, net banking
- **Auto-pay**: Automated rent payments
- **Payment History**: Complete transaction records
- **Receipts**: Downloadable payment receipts

## 💳 PhonePe Payment Setup

### UAT Testing
The application is pre-configured for PhonePe UAT testing:

```bash
# Test VPAs (for UPI testing)
Success: success@ybl
Failure: failed@ybl  
Pending: pending@ybl
```

### Production Setup
1. Get production credentials from PhonePe
2. Update environment variables:
   ```bash
   PHONEPE_ENV=PRODUCTION
   PHONEPE_MERCHANT_ID=your_production_merchant_id
   PHONEPE_SALT_KEY=your_production_salt_key
   ```

### Callback Configuration
Contact PhonePe integration team to configure:
- **Callback URL**: `https://yourdomain.com/api/custom/payments/phonepe/callback`
- **Webhook URL**: Same as callback URL

## 🧪 Testing

### Database Seeding
Use the admin dashboard "Seed Test Data" button to populate:
- 12 sample customers (login: customer1@example.com, password: password1)
- Sample properties and rooms
- Test bookings and payments
- Support tickets and media

### Test Credentials
```
Customer Login:
- Email: customer1@example.com
- Password: password1

Admin Login:
- Email: admin1@example.com  
- Password: password123
```

### Test Payment Flow
1. Create a booking on property page
2. Proceed to payment
3. Use test VPAs for UPI testing
4. Verify payment status in admin panel

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up -d

# Or build production image
docker build -t fly-pg .
docker run -p 3000:3000 fly-pg
```

### Environment Variables
```bash
# Production
NODE_ENV=production
DATABASE_URI=mongodb://your-mongodb-uri
PAYLOAD_SECRET=your-secret-key
PHONEPE_ENV=PRODUCTION

# IMPORTANT: Site URL Configuration
# Set this to your production domain to prevent localhost URLs in preview links
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# For Vercel deployments, this is automatically set as:
# VERCEL_URL=your-vercel-deployment-url.vercel.app

# Preview secret for admin preview functionality
PREVIEW_SECRET=your-secure-preview-secret
```

## 📚 API Documentation

### Key Endpoints
- `POST /api/custom/booking` - Create booking
- `POST /api/custom/payments/phonepe/initiate` - Initiate payment
- `GET /api/custom/customers/profile` - Get customer profile
- `POST /api/custom/customers/support/tickets` - Create support ticket

### Authentication
- Customer authentication via JWT tokens
- Admin authentication via Payload CMS
- Session management with httpOnly cookies

## 🔧 Development

### Preview URL Configuration
The admin preview functionality automatically detects the correct domain:

1. **Development**: Uses `http://localhost:3000`
2. **Production**: Requires `NEXT_PUBLIC_SITE_URL` environment variable
3. **Vercel**: Automatically uses `VERCEL_URL` if available
4. **Dynamic Detection**: Falls back to request headers if no env vars are set

**Important**: Always set `NEXT_PUBLIC_SITE_URL` in production to prevent localhost URLs.

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Run ESLint
```

### Database Seeding
```bash
# Seed via API
curl -X POST http://localhost:3000/api/seed

# Or use admin dashboard button
```

## 💳 PhonePe Payment Integration

### Environment Setup
```bash
# PhonePe UAT (Testing) Environment
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_KEY_INDEX=1
PHONEPE_BASE_URL=https://api-uat.phonepe.com/apis/hermes
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Testing Setup
1. **Install PhonePe Test App**: `com.phonepe.simulator`
2. **Configure Test Templates**: Use "Paypage" templates for Standard Checkout V2
3. **Test VPAs**:
   - Success: `success@ybl` (redirects within 5 seconds)
   - Failure: `failed@ybl` (redirects within 5 seconds)
   - Pending: `pending@ybl` (redirects within 60 seconds)

### Test Card Details
- **Credit Card**: `4208 5851 9011 6667` (Expiry: 06/2027, CVV: 508)
- **Debit Card**: `4242 4242 4242 4242` (Expiry: 12/2023, CVV: 936)
- **Simulation OTP**: `123456`

### Webhook Configuration
**Important**: Webhooks must be configured through PhonePe support team:
1. Contact PhonePe Integration Team
2. Provide callback URL: `https://yourdomain.com/api/custom/payments/phonepe/callback`
3. Request webhook authentication credentials
4. Configure event types: `CHECKOUT_ORDER_COMPLETED`, `CHECKOUT_ORDER_FAILED`

### Testing Workflow
1. Create booking → Initiate payment → Complete on PhonePe → Verify callback
2. Use admin tools for manual status updates
3. Monitor webhook delivery and signature verification

### Production Setup
- Update environment variables for production
- Configure production webhooks with PhonePe
- Implement proper monitoring and error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation files
- Review the PhonePe integration guides

---

**Built with ❤️ using Next.js, Payload CMS, and PhonePe**