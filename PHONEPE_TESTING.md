# PhonePe Payment Gateway Testing Guide

This guide will help you test the PhonePe payment gateway integration in your FLY-pg application.

## Prerequisites

1. **Environment Setup**: Copy the configuration from `env.example` to `.env.local`
2. **PhonePe UAT Account**: The testing credentials are already configured for UAT environment
3. **Local Development Server**: Ensure your Next.js app is running on `http://localhost:3000`

## Environment Configuration

Copy the following to your `.env.local` file:

```bash
# PhonePe UAT (Testing) Environment
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_KEY_INDEX=1
PHONEPE_BASE_URL=https://api-uat.phonepe.com/apis/hermes

# Site URL for redirects and callbacks
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# PhonePe Callback Verification Path
PHONEPE_CALLBACK_VERIFY_PATH=/api/custom/payments/phonepe/callback

# Node Options
NODE_OPTIONS="--no-deprecation --no-experimental-strip-types"
```

## Testing Flow

### 1. Create a Test Booking

1. Navigate to your property listing page
2. Select a room and click "Book Now"
3. Fill in the booking form with test data
4. Submit the booking - this will create a pending payment

### 2. Initiate PhonePe Payment

1. After booking creation, you'll see a "Pay Now" button
2. Click "Pay Now" to initiate the PhonePe payment
3. The system will:
   - Create a PhonePe transaction
   - Generate a redirect URL
   - Redirect you to PhonePe's payment page

### 3. Complete Payment on PhonePe

1. On PhonePe's payment page, use these test credentials:
   - **UPI**: Use any valid UPI ID (e.g., `test@upi`)
   - **Card**: Use test card numbers from PhonePe documentation
   - **Net Banking**: Use any test bank credentials

2. Complete the payment process

### 4. Payment Callback

1. After successful payment, PhonePe will redirect back to your success page
2. The callback will automatically update the payment status
3. The booking will be marked as "confirmed"

## Testing Endpoints

### Payment Initiation
```
POST /api/custom/payments/phonepe/initiate
Content-Type: application/json

{
  "paymentId": "your-payment-id"
}
```

### Payment Status Check
```
GET /api/custom/payments/phonepe/status?paymentId=your-payment-id
```

### Payment Callback (Webhook)
```
POST /api/custom/payments/phonepe/callback
```

## Admin Tools

### PhonePe Tools in Admin Panel

1. Navigate to the admin panel: `http://localhost:3000/admin`
2. Go to Payments collection
3. Open any payment record
4. Use the "PhonePe Tools" section to:
   - Recheck payment status
   - View raw JSON response
   - Manually mark payment as completed/failed

### Manual Payment Status Update

```bash
# Mark payment as completed
curl -X POST http://localhost:3000/api/custom/payments/admin/mark-completed \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "your-payment-id"}'

# Mark payment as failed
curl -X POST http://localhost:3000/api/custom/payments/admin/mark-failed \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "your-payment-id"}'
```

## Test Data

### Test Card Numbers (for UAT environment)
- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Test UPI IDs
- `test@upi`
- `success@upi`
- `failure@upi`

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure `.env.local` file exists with all required variables
   - Restart your development server after adding environment variables

2. **Payment Initiation Fails**
   - Check browser console for errors
   - Verify PhonePe credentials are correct
   - Ensure `NEXT_PUBLIC_SITE_URL` is set correctly

3. **Callback Not Working**
   - Verify the callback URL is accessible
   - Check server logs for signature verification errors
   - Ensure `PHONEPE_CALLBACK_VERIFY_PATH` is set correctly

4. **Payment Status Not Updating**
   - Use admin tools to manually check status
   - Verify the payment ID format matches expected pattern
   - Check PhonePe transaction logs

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
DEBUG=phonepe:*
```

## Production Considerations

When moving to production:

1. **Update Environment Variables**:
   - Change `PHONEPE_BASE_URL` to production URL
   - Update `PHONEPE_MERCHANT_ID` and `PHONEPE_SALT_KEY` with production credentials
   - Set `NEXT_PUBLIC_SITE_URL` to your production domain

2. **Security**:
   - Ensure all environment variables are properly secured
   - Use HTTPS for all production URLs
   - Implement proper error handling and logging

3. **Monitoring**:
   - Set up webhook monitoring
   - Implement payment reconciliation
   - Monitor payment success/failure rates

## PhonePe Documentation Reference

For more details, refer to the [PhonePe Payment Gateway Documentation](https://developer.phonepe.com/payment-gateway).

## Support

If you encounter issues:
1. Check the PhonePe UAT documentation
2. Review server logs for detailed error messages
3. Use the admin tools to debug payment status
4. Contact PhonePe support for UAT environment issues
