# PhonePe UAT Sandbox Setup Guide

Based on the [PhonePe UAT Sandbox documentation](https://developer.phonepe.com/payment-gateway/uat-testing-go-live/uat-sandbox), here's how to properly set up and test the payment integration.

## 1. Environment Configuration

### Update Host URL for UAT Sandbox
Replace your current PhonePe host URL with the UAT Sandbox endpoint:

```bash
# In your .env.local file
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pgsandbox
```

This routes all payment and status check requests to the sandbox for simulation.

## 2. Install PhonePe Test App

### Android Setup
1. **Download the PhonePe Test App**: `com.phonepe.simulator`
2. **Install the app** on your test device
3. **Allow Developer Access** if prompted

### iOS Setup
1. **Contact PhonePe Integration Team** with your email ID
2. **Receive Firebase invite** for the Test App
3. **Trust the Developer**:
   - Go to Settings > General > VPN & Device Management
   - Tap on the Developer App
   - Select Trust [Developer]
   - Confirm by selecting Trust again

## 3. Configure Test Templates

### For Standard Checkout Integration
1. **Open PhonePe Test App** and tap on "Test Case Templates"
2. **Enter your Merchant ID** and click "Get Configured Templates"
3. **Select Flow**: Custom and Standard Checkout V2
4. **Configure Templates** based on test scenario:
   - **Success**: Paypage Upi Intent Success
   - **Failure**: Paypage Upi Intent Failure  
   - **Pending**: Paypage Upi Intent Pending

**⚠️ Important**: Templates for Standard Checkout begin with keyword "Paypage"

### Callback Configuration
**Important**: PhonePe callbacks (webhooks) are NOT configured through the SDK. They must be set up on the PhonePe side:

1. **Contact PhonePe Integration Team** to configure your callback URL
2. **Provide your callback endpoint**: `https://yourdomain.com/api/custom/payments/phonepe/callback`
3. **Verify the callback URL** is accessible from PhonePe servers
4. **Test callback delivery** during UAT setup

**Note**: The SDK only handles payment initiation and status checking. Callbacks are configured separately on PhonePe's merchant dashboard.

## 4. Testing Different Payment Methods

### UPI Collect Requests with VPA
For UPI testing, use these predefined VPAs:

| Scenario | VPA | Expected Behavior |
|----------|-----|-------------------|
| **Success** | `success@ybl` | Redirection within 5 seconds |
| **Failure** | `failed@ybl` | Redirection within 5 seconds |
| **Pending** | `pending@ybl` | Redirection within 60 seconds |

**⚠️ Do NOT use PhonePe Simulator App for VPA setting**

### Card and NetBanking Transactions
- **No manual template setting required**
- You'll be redirected to a page where you can choose Success/Failure/Pending
- Templates are automatically applied based on your selection

### Test Card Details
Use these test cards for card transactions:

#### Credit Card
- **Card Number**: `4208 5851 9011 6667`
- **Card Type**: `CREDIT_CARD`
- **Issuer**: `VISA`
- **Expiry**: `06/2027`
- **CVV**: `508`

#### Debit Card
- **Card Number**: `4242 4242 4242 4242`
- **Card Type**: `DEBIT_CARD`
- **Issuer**: `VISA`
- **Expiry**: `12/2023`
- **CVV**: `936`

**ℹ️ Simulation OTP**: Use `123456` on the bank page

## 5. Testing Workflow

### Step-by-Step Testing Process

1. **Initiate Payment** from your application
2. **Redirect to PhonePe** (should use UAT Sandbox URL)
3. **Choose Payment Method**:
   - For UPI: Use `success@ybl` for success simulation
   - For Cards/NetBanking: Select Success/Failure/Pending on the page
4. **Complete Transaction** using test credentials
5. **Return to Success Page** - should show correct status

### Expected Response Codes
Based on PhonePe documentation, expect these response codes:

| Scenario | Code/State | Expected Behavior |
|----------|------------|-------------------|
| **Success** | `PAYMENT_SUCCESS` or `SUCCESS` | Payment completed, booking confirmed |
| **Failure** | `PAYMENT_ERROR` or `FAILED` | Payment failed, booking cancelled |
| **Pending** | `PAYMENT_PENDING` | Payment processing, check status later |

## 6. Troubleshooting

### Common Issues

1. **"Untrusted Enterprise Developer" (iOS)**
   - Follow the trust developer steps above
   - Ensure you're using the correct Test App

2. **Invalid Template Configuration**
   - Verify you're using "Paypage" templates
   - Check that templates are for Standard Checkout V2

3. **Callback Not Received**
   - Verify callback URL is accessible
   - Check server logs for webhook processing
   - Ensure proper signature verification

4. **Status Not Updated**
   - Check payment status API endpoint
   - Verify database updates are working
   - Monitor callback processing logs

### Debug Information
The enhanced logging will show:
- PhonePe response codes and states
- Payment status detection logic
- Database update confirmations
- Webhook processing details

## 7. Production Readiness

Before going live:
1. **Complete all UAT Sandbox testing scenarios**
2. **Verify callback handling works correctly**
3. **Test error scenarios thoroughly**
4. **Update environment variables for production**
5. **Configure production webhooks**

## 8. Support

For UAT issues:
- Contact PhonePe Integration Team
- Reference your integration thread
- Include detailed error logs and test scenarios
